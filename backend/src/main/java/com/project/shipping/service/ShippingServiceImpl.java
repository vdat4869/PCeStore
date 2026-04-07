package com.project.shipping.service;

import com.project.order.entity.Order;
import com.project.shipping.entity.Shipping;
import com.project.shipping.entity.ShippingStatus;
import com.project.shipping.repository.ShippingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

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
            return BigDecimal.valueOf(20000); // 20k nội thành
        }
        return BigDecimal.valueOf(50000); // 50k ngoại thành
    }

    @Override
    @Transactional
    public Shipping createShippingForOrder(Order order, String deliveryAddress) {
        BigDecimal cost = calculateShippingCost(deliveryAddress);
        // Fixed: replaced System.currentTimeMillis() with UUID to prevent collision under concurrency
        String tCode = "VN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        Shipping shipping = Shipping.builder()
                .order(order)
                .deliveryAddress(deliveryAddress)
                .shippingCost(cost)
                .status(ShippingStatus.PENDING)
                .trackingCode(tCode)
                .build();

        return shippingRepository.save(shipping);
    }

    @Override
    public Shipping trackShipping(Long orderId) {
        return shippingRepository.findByOrderId(orderId).orElse(null);
    }

    @Override
    public Optional<Shipping> getShippingByOrderId(Long orderId) {
        return shippingRepository.findByOrderId(orderId);
    }

    @Override
    @Transactional
    public Shipping updateShippingStatus(Long shippingId, ShippingStatus newStatus) {
        Shipping shipping = shippingRepository.findById(shippingId)
                .orElseThrow(() -> new RuntimeException("error.shipping.not_found"));

        // Basic state machine: prevent invalid backward transitions
        if (shipping.getStatus() == ShippingStatus.DELIVERED || shipping.getStatus() == ShippingStatus.CANCELLED) {
            throw new RuntimeException("error.shipping.cannot_update_final_status");
        }

        shipping.setStatus(newStatus);
        return shippingRepository.save(shipping);
    }
}
