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
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;

    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository, @Lazy OrderService orderService) {
        this.paymentRepository = paymentRepository;
        this.orderService = orderService;
    }

    @Value("${sepay.merchant-id}")
    private String merchantId;

    @Value("${sepay.secret-key}")
    private String secretKey;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        // Mock processing logic (as required for Mock payment)
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaymentDate(LocalDateTime.now());
        
        orderService.updateOrderStatus(payment.getOrderId(), OrderStatus.PAID);
        
        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for Order ID: " + orderId));
    }

    @Override
    @Transactional
    public Payment updatePaymentStatus(Long paymentId, PaymentStatus status, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
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
    public Map<String, String> initiateSePayCheckout(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("merchant", merchantId);
        fields.put("operation", "PURCHASE");
        fields.put("payment_method", "BANK_TRANSFER");
        fields.put("order_amount", payment.getAmount().stripTrailingZeros().toPlainString());
        fields.put("currency", "VND"); // Default to VND for SePay
        fields.put("order_invoice_number", "INV-" + payment.getOrderId());
        fields.put("order_description", "Thanh toan don hang D" + payment.getOrderId());
        
        // Cấu hình các URL về thẳng Frontend React tĩnh thay vì hardcode
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
                Long orderId = Long.parseLong(invoiceNumber.replace("INV-", ""));
                
                paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
                    payment.setStatus(PaymentStatus.COMPLETED);
                    
                    if (request.getTransaction() != null) {
                        payment.setTransactionId(request.getTransaction().getTransactionId());
                    }
                    payment.setPaymentDate(LocalDateTime.now());
                    paymentRepository.save(payment);
                    
                    orderService.updateOrderStatus(orderId, OrderStatus.PAID);
                });
            }
        }
    }
}
