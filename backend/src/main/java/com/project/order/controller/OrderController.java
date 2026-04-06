package com.project.order.controller;

import com.project.order.dto.OrderRequestDTO;
import com.project.order.entity.Order;
import com.project.order.service.OrderService;
import com.project.payment.entity.Payment;
import com.project.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final com.project.shipping.repository.ShippingRepository shippingRepository;

    public OrderController(OrderService orderService, PaymentService paymentService, com.project.shipping.repository.ShippingRepository shippingRepository) {
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.shippingRepository = shippingRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderRequestDTO requestDTO) {
        // 1. Create order
        Order order = orderService.createOrder(requestDTO);

        // 2. Create payment automatically based on total amount and payment method
        String paymentMethod = (requestDTO.getPaymentMethod() != null) ? requestDTO.getPaymentMethod() : "MOCK";
        Payment payment = paymentService.createPayment(order.getId(), order.getTotalAmount(), paymentMethod);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("payment", payment);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getOrderHistory(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrderHistory(userId);
        java.util.ArrayList<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("totalAmount", o.getTotalAmount());
            map.put("status", o.getStatus());
            map.put("orderDate", o.getOrderDate());
            if (o.getShipping() != null) {
                com.project.shipping.entity.Shipping current = o.getShipping();
                Map<String, Object> sMap = new HashMap<>();
                sMap.put("status", current.getStatus());
                sMap.put("trackingCode", current.getTrackingCode());
                sMap.put("deliveryAddress", current.getDeliveryAddress());
                map.put("shipping", sMap);

                // UX Trick: Bump state but return old state
                if (current.getStatus() == com.project.shipping.entity.ShippingStatus.IN_TRANSIT) {
                    current.setStatus(com.project.shipping.entity.ShippingStatus.DELIVERED);
                    shippingRepository.save(current);
                }
            }
            
            Payment payment = paymentService.getPaymentByOrderId(o.getId());
            if (payment != null) {
                map.put("paymentStatus", payment.getStatus());
                map.put("paymentMethod", payment.getPaymentMethod());
            }
            // Móc nối danh sách sản phẩm
            java.util.List<Map<String, Object>> items = new java.util.ArrayList<>();
            for (com.project.order.entity.OrderItem item : o.getOrderItems()) {
                Map<String, Object> iMap = new HashMap<>();
                iMap.put("productName", item.getProduct().getName());
                iMap.put("quantity", item.getQuantity());
                iMap.put("price", item.getPrice());
                items.add(iMap);
            }
            map.put("items", items);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok("Order cancelled successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Order deleted successfully");
    }

    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<String> deleteAllOrders(@PathVariable Long userId) {
        orderService.deleteAllOrders(userId);
        return ResponseEntity.ok("All orders deleted successfully");
    }
}
