package com.project.payment.controller;

import com.project.payment.entity.Payment;
import com.project.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import com.project.payment.dto.SePayIpnRequest;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

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
    public ResponseEntity<Map<String, Boolean>> processSePayIpn(@RequestBody SePayIpnRequest ipnRequest) {
        paymentService.processSePayIpn(ipnRequest);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/callback")
    public ResponseEntity<String> handleSePayCallback(@RequestParam String status) {
        if ("success".equals(status)) {
            return ResponseEntity.ok("Thanh toán thành công! Đơn hàng của bạn đang được xử lý.");
        } else if ("cancel".equals(status)) {
            return ResponseEntity.ok("Thanh toán đã bị huỷ bởi người dùng.");
        }
        return ResponseEntity.ok("Thanh toán thất bại, vui lòng thử lại.");
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable Long orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(payment);
    }
}
