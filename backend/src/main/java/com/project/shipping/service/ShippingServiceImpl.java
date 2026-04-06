package com.project.shipping.service;

import com.project.order.entity.Order;
import com.project.shipping.entity.Shipping;
import com.project.shipping.entity.ShippingStatus;
import com.project.shipping.repository.ShippingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

    private final ShippingRepository shippingRepository;

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

        Shipping shipping = Shipping.builder()
                .order(order)
                .deliveryAddress(deliveryAddress)
                .shippingCost(cost)
                .status(ShippingStatus.PENDING)
                .trackingCode(tCode)
                .build();
        
        return shipping;
    }

    @Override
    public Shipping trackShipping(Long orderId) {
        // Find by logic could be implemented if necessary
        return null;
    }
}
