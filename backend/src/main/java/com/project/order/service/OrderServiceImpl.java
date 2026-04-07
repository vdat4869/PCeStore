package com.project.order.service;

import com.project.order.dto.OrderItemRequestDTO;
import com.project.order.dto.OrderRequestDTO;
import com.project.order.entity.Order;
import com.project.order.entity.OrderItem;
import com.project.order.entity.OrderStatus;
import com.project.order.repository.OrderRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import com.project.shipping.service.ShippingService;
import com.project.shipping.entity.Shipping;
import com.project.inventory.service.InventoryService;
import com.project.inventory.dto.InventoryRequest;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ShippingService shippingService;
    private final com.project.payment.repository.PaymentRepository paymentRepository;
    private final InventoryService inventoryService;

    private static final String ORDER_NOT_FOUND_MSG = "Order not found with id: ";

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public Order createOrder(OrderRequestDTO requestDTO) {
        if (requestDTO.getItems() == null || requestDTO.getItems().isEmpty()) {
            throw new RuntimeException("error.order.items_required");
        }

        Order order = Order.builder()
                .userId(requestDTO.getUserId())
                .status(OrderStatus.PENDING)
                .shippingAddress(requestDTO.getShippingAddress())
                .orderDate(LocalDateTime.now())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequestDTO itemDto : requestDTO.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm ID " + itemDto.getProductId() + " không tồn tại"));

            if (product.getInventory() == null || product.getInventory().getQuantity() - product.getInventory().getReserved() < itemDto.getQuantity()) {
                throw new RuntimeException("error.inventory.insufficient_stock");
            }

            // Reserve stock
            inventoryService.reserveStock(new InventoryRequest(product.getId(), itemDto.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(BigDecimal.valueOf(product.getPrice()))
                    .build();

            order.addOrderItem(orderItem);
            total = total.add(BigDecimal.valueOf(product.getPrice()).multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        // Create Shipping details
        Shipping shipping = shippingService.createShippingForOrder(order, requestDTO.getShippingAddress());
        order.setShipping(shipping);
        total = total.add(shipping.getShippingCost());

        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("error.order.not_found"));
    }

    @Override
    public List<Order> getOrderHistory(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        if (status == OrderStatus.PAID && order.getStatus() != OrderStatus.PAID) {
            for (OrderItem item : order.getOrderItems()) {
                inventoryService.confirmStock(new InventoryRequest(item.getProduct().getId(), item.getQuantity()));
            }
            if (order.getShipping() != null) {
                order.getShipping().setStatus(com.project.shipping.entity.ShippingStatus.IN_TRANSIT);
            }
        }
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("error.order.cannot_cancel_status");
        }
        
        // Cancel reservation
        for(OrderItem item : order.getOrderItems()) {
            inventoryService.cancelReservation(new InventoryRequest(item.getProduct().getId(), item.getQuantity()));
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("error.order.not_found"));
        
        order.setDeleted(true);
        // Soft delete items as well
        order.getOrderItems().forEach(item -> item.setDeleted(true));
        
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void restoreOrder(Long orderId) {
        Order order = orderRepository.findByIdIncludingDeleted(orderId)
                .orElseThrow(() -> new RuntimeException("error.order.not_found"));
        
        order.setDeleted(false);
        order.getOrderItems().forEach(item -> item.setDeleted(false));
        
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteAllOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        for (Order o : orders) {
            paymentRepository.findByOrderId(o.getId()).ifPresent(p -> paymentRepository.delete(p));
            o.setDeleted(true);
            o.getOrderItems().forEach(item -> item.setDeleted(true));
            orderRepository.save(o);
        }
    }
}
