package com.project.payment.service;

import com.project.payment.entity.Payment;
import com.project.payment.entity.PaymentStatus;

import java.math.BigDecimal;

import java.util.Map;
import com.project.payment.dto.SePayIpnRequest;

public interface PaymentService {
    Payment createPayment(Long orderId, BigDecimal amount, String paymentMethod);
    Payment processPayment(Long paymentId);
    Payment getPaymentByOrderId(Long orderId);
    Payment updatePaymentStatus(Long paymentId, PaymentStatus status, String transactionId);

    Map<String, String> initiateSePayCheckout(Long paymentId);
    void processSePayIpn(SePayIpnRequest request);
}
