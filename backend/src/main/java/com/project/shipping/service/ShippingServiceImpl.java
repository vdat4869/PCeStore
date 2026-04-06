package com.project.shipping.service;

import com.project.order.entity.Order;
import com.project.shipping.entity.Shipping;
import com.project.shipping.entity.ShippingStatus;
import com.project.shipping.repository.ShippingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class ShippingServiceImpl implements ShippingService {

    private final ShippingRepository shippingRepository;

    public ShippingServiceImpl(ShippingRepository shippingRepository) {
        this.shippingRepository = shippingRepository;
    }

    @Override
    public BigDecimal calculateShippingCost(String address) {
        if (address == null || address.isEmpty()) return BigDecimal.valueOf(50000);
        String lowerAddress = address.toLowerCase();
        if (lowerAddress.contains("hồ chí minh") || lowerAddress.contains("ho chi minh") || lowerAddress.contains("hcm")) {
            return BigDecimal.valueOf(20000); // 20k cho nội thành
        }
        return BigDecimal.valueOf(50000); // 50k ngoại thành
    }

    @Override
    @Transactional
    public Shipping createShippingForOrder(Order order, String deliveryAddress) {
        BigDecimal cost = calculateShippingCost(deliveryAddress);
        String tCode = "VN-" + System.currentTimeMillis();

        return Shipping.builder()
                .order(order)
                .deliveryAddress(deliveryAddress)
                .shippingCost(cost)
                .status(ShippingStatus.PENDING)
                .trackingCode(tCode)
                .build();
    }

    @Override
    public Shipping trackShipping(Long orderId) {
        return shippingRepository.findByOrderId(orderId).orElse(null);
    }
}
