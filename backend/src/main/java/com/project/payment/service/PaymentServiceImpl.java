package com.project.payment.service;

import com.project.payment.entity.Payment;
import com.project.payment.entity.PaymentStatus;
import com.project.payment.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.LinkedHashMap;

import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.beans.factory.annotation.Value;
import com.project.payment.dto.SePayIpnRequest;
import com.project.payment.utils.SecurityUtils;
import com.project.order.service.OrderService;
import com.project.order.entity.OrderStatus;
import com.project.order.entity.Order;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import com.project.payment.dto.SePayTransactionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PAYMENT_NOT_FOUND_MSG = "Payment not found";

    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository, @Lazy OrderService orderService) {
        this.paymentRepository = paymentRepository;
        this.orderService = orderService;
    }

    @Value("${sepay.merchant-id}")
    private String merchantId;

    @Value("${sepay.secret-key}")
    private String secretKey;

    @Value("${custom.frontend.url}")
    private String frontendUrl;

    @Value("${sepay.api-token}")
    private String apiToken;

    @Override
    @Transactional
    public Payment createPayment(Long orderId, BigDecimal amount, String paymentMethod) {
        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .status(PaymentStatus.PENDING)
                .build();
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment processPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaymentDate(LocalDateTime.now());

        orderService.updateOrderStatus(payment.getOrderId(), OrderStatus.PAID);

        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG + " for Order ID: " + orderId));
    }

    @Override
    public Payment getPaymentByOrderId(Long orderId, Long userId) {
        Order order = orderService.getOrderById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access this payment record");
        }
        return getPaymentByOrderId(orderId);
    }

    @Override
    @Transactional
    public Payment updatePaymentStatus(Long paymentId, PaymentStatus status, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG));
        payment.setStatus(status);
        if (transactionId != null) {
            payment.setTransactionId(transactionId);
        }
        if (status == PaymentStatus.COMPLETED) {
            payment.setPaymentDate(LocalDateTime.now());
        }
        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG));
    }

    @Override
    public Map<String, String> initiateSePayCheckout(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG));

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("order_amount", payment.getAmount().setScale(0, java.math.RoundingMode.HALF_UP).toString());
        fields.put("merchant", merchantId);
        fields.put("currency", "VND");
        fields.put("operation", "PURCHASE");
        fields.put("order_description", "Thanh toan don hang D" + payment.getOrderId());
        
        String uniqueInvoice = "INV-" + payment.getOrderId() + "-" + System.currentTimeMillis();
        fields.put("order_invoice_number", uniqueInvoice);
        
        fields.put("customer_id", "CUST-" + payment.getOrderId());
        fields.put("payment_method", "BANK_TRANSFER");
        fields.put("success_url", frontendUrl + "/?status=success");
        fields.put("error_url", frontendUrl + "/?status=error");
        fields.put("cancel_url", frontendUrl + "/?status=cancel");

        String signature = SecurityUtils.generateSePaySignature(fields, secretKey);
        fields.put("signature", signature);

        return fields;
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void processSePayIpn(SePayIpnRequest request) {
        if ("ORDER_PAID".equals(request.getNotificationType()) && request.getOrder() != null) {
            String invoiceNumber = request.getOrder().getOrderInvoiceNumber();
            if (invoiceNumber != null && invoiceNumber.startsWith("INV-")) {
                String[] parts = invoiceNumber.split("-");
                if (parts.length >= 2) {
                    Long orderId = Long.valueOf(parts[1]);

                    paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
                        if (payment.getStatus() == PaymentStatus.PENDING) {
                            payment.setStatus(PaymentStatus.COMPLETED);
                            if (request.getTransaction() != null) {
                                payment.setTransactionId(request.getTransaction().getTransactionId());
                            }
                            payment.setPaymentDate(LocalDateTime.now());
                            paymentRepository.save(payment);
                            orderService.updateOrderStatus(orderId, OrderStatus.PAID);
                        }
                    });
                }
            }
        }
    }

    @Override
    @Transactional
    public void syncWithSePay() {
        if (apiToken == null || apiToken.trim().isEmpty()) {
            log.warn("SePay API Token is not configured. Auto-reconciliation is disabled.");
            return;
        }

        try {
            log.info("Starting SePay transaction synchronization...");
            String url = "https://my.sepay.vn/userapi/transactions/list";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            SePayTransactionResponse response = restTemplate.exchange(url, HttpMethod.GET, entity, SePayTransactionResponse.class).getBody();

            if (response != null && response.getTransactions() != null) {
                processTransactions(response.getTransactions());
            }
        } catch (Exception e) {
            log.error("Error during SePay sync: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void reconcileOrder(Long orderId) {
        log.info("Manually reconciling order #{}", orderId);
        syncWithSePay();
    }

    private void processTransactions(List<SePayTransactionResponse.SePayTransactionDTO> transactions) {
        for (SePayTransactionResponse.SePayTransactionDTO tx : transactions) {
            String content = tx.getTransaction_content();
            if (content == null) continue;

            Long orderId = extractOrderIdFromContent(content);
            if (orderId != null) {
                paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
                    if (payment.getStatus() == PaymentStatus.PENDING) {
                        BigDecimal txAmount = new BigDecimal(tx.getAmount_in());
                        if (txAmount.compareTo(payment.getAmount()) >= 0) {
                            log.info("Match found for Order #{}. Updating status to PAID.", orderId);
                            payment.setStatus(PaymentStatus.COMPLETED);
                            payment.setTransactionId(tx.getReference_number() != null ? tx.getReference_number() : tx.getCode());
                            payment.setPaymentDate(LocalDateTime.now());
                            paymentRepository.save(payment);
                            orderService.updateOrderStatus(orderId, OrderStatus.PAID);
                        }
                    }
                });
            }
        }
    }

    private Long extractOrderIdFromContent(String content) {
        try {
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(?:D|INV-)(\\d+)");
            java.util.regex.Matcher matcher = pattern.matcher(content);
            if (matcher.find()) {
                return Long.parseLong(matcher.group(1));
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }
}