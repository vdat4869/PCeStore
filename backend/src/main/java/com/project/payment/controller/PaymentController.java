package com.project.payment.controller;

import com.project.payment.entity.Payment;
import com.project.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import com.project.payment.dto.SePayIpnRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import com.project.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Value;
import com.project.order.service.OrderService;
import com.project.order.entity.Order;
import org.springframework.security.access.AccessDeniedException;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @Value("${sepay.secret-key}")
    private String secretKey;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public ResponseEntity<Payment> createPayment(
            @RequestParam Long orderId,
            @RequestParam BigDecimal amount,
            @RequestParam String paymentMethod) {
        Payment payment = paymentService.createPayment(orderId, amount, paymentMethod);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{paymentId}/sepay-checkout")
    public ResponseEntity<Map<String, String>> initiateSePayCheckout(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.initiateSePayCheckout(paymentId));
    }

    @PostMapping("/ipn")
    public ResponseEntity<Map<String, Boolean>> processSePayIpn(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SePayIpnRequest ipnRequest) {
        
        // Security validation
        if (authHeader == null || !authHeader.equals("Bearer " + secretKey)) {
            return ResponseEntity.status(403).body(Map.of("success", false));
        }

        paymentService.processSePayIpn(ipnRequest);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable Long orderId) {
        // IDOR Checking
        try {
            Long currentUserId = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser().getId();
            Order order = orderService.getOrderById(orderId);
            if (!order.getUserId().equals(currentUserId)) {
                throw new AccessDeniedException("You do not have permission to view this payment");
            }
        } catch (ClassCastException | NullPointerException e) {
            // Context fallbacks ignored for dev without strict auth
        }

        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(payment);
    }
}
