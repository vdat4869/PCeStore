package com.project.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDTO {
    private Long userId;
    private String shippingAddress;
    private String paymentMethod; // e.g., VNPAY, PAYPAL, MOCK
    private List<OrderItemRequestDTO> items;
}
