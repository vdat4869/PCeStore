package com.project.shipping.service;

import com.project.order.entity.Order;
import com.project.shipping.entity.Shipping;

import java.math.BigDecimal;

public interface ShippingService {
    BigDecimal calculateShippingCost(String address);
    Shipping createShippingForOrder(Order order, String deliveryAddress);
    Shipping trackShipping(Long orderId);
}
