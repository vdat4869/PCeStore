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

    @Override
    @Transactional
    public Order createOrder(OrderRequestDTO requestDTO) {
        Order order = Order.builder()
                .userId(requestDTO.getUserId())
                .status(OrderStatus.PENDING)
                .shippingAddress(requestDTO.getShippingAddress())
                .orderDate(LocalDateTime.now())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequestDTO itemDto : requestDTO.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getInventory() == null || product.getInventory().getQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            // Deduct stock
            product.getInventory().setQuantity(product.getInventory().getQuantity() - itemDto.getQuantity());
            productRepository.save(product);

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
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<Order> getOrderHistory(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        if (status == OrderStatus.PAID && order.getShipping() != null) {
            order.getShipping().setStatus(com.project.shipping.entity.ShippingStatus.IN_TRANSIT);
        }
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus());
        }
        
        // Restore stock
        for(OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product.getInventory() != null) {
                product.getInventory().setQuantity(product.getInventory().getQuantity() + item.getQuantity());
            }
            productRepository.save(product);
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        order.setDeleted(true);
        // Soft delete items as well
        order.getOrderItems().forEach(item -> item.setDeleted(true));
        
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void restoreOrder(Long orderId) {
        Order order = orderRepository.findByIdIncludingDeleted(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
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
        }
        orderRepository.deleteAll(orders);
    }
}
