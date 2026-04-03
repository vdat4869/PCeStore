package com.project.order.controller;

import com.project.order.dto.OrderRequestDTO;
import com.project.order.entity.Order;
import com.project.order.service.OrderService;
import com.project.payment.entity.Payment;
import com.project.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderRequestDTO requestDTO) {
        // 1. Create order
        Order order = orderService.createOrder(requestDTO);

        // 2. Create payment automatically based on total amount and payment method
        String paymentMethod = (requestDTO.getPaymentMethod() != null) ? requestDTO.getPaymentMethod() : "MOCK";
        Payment payment = paymentService.createPayment(order.getId(), order.getTotalAmount(), paymentMethod);

        Map<String, Object> response = new HashMap<>();
        response.put("order", order);
        response.put("payment", payment);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrderHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrderHistory(userId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok("Order cancelled successfully");
    }
}
