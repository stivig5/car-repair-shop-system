package com.diploma.carservice.service;

import com.diploma.carservice.entity.InventoryPart;
import com.diploma.carservice.entity.Order;
import com.diploma.carservice.entity.OrderPart;
import com.diploma.carservice.repository.InventoryPartRepository;
import com.diploma.carservice.repository.OrderPartRepository;
import com.diploma.carservice.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderPartService {

    private final OrderPartRepository orderPartRepository;
    private final OrderRepository orderRepository;
    private final InventoryPartRepository inventoryPartRepository;

    public OrderPartService(OrderPartRepository orderPartRepository, OrderRepository orderRepository, InventoryPartRepository inventoryPartRepository) {
        this.orderPartRepository = orderPartRepository;
        this.orderRepository = orderRepository;
        this.inventoryPartRepository = inventoryPartRepository;
    }

    public List<OrderPart> getAllOrderParts() {
        return orderPartRepository.findAll();
    }

    @Transactional
    public OrderPart addPartToOrder(Long orderId, Long partId, int quantity) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        InventoryPart part = inventoryPartRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Part not found"));

        if (part.getQuantityInStock() < quantity) {
            throw new RuntimeException("Not enough parts in stock");
        }

        part.setQuantityInStock(part.getQuantityInStock() - quantity);
        inventoryPartRepository.save(part);

        OrderPart orderPart = new OrderPart();
        orderPart.setOrder(order);
        orderPart.setPart(part);
        orderPart.setQuantity(quantity);

        OrderPart savedOrderPart = orderPartRepository.save(orderPart);

        BigDecimal currentTotal = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal partsCost = part.getPrice().multiply(BigDecimal.valueOf(quantity));
        order.setTotalPrice(currentTotal.add(partsCost));
        orderRepository.save(order);

        return savedOrderPart;
    }

    @Transactional
    public void removePartFromOrder(Long orderPartId) {
        OrderPart orderPart = orderPartRepository.findById(orderPartId)
                .orElseThrow(() -> new RuntimeException("OrderPart not found"));

        Order order = orderPart.getOrder();
        InventoryPart part = orderPart.getPart();

        part.setQuantityInStock(part.getQuantityInStock() + orderPart.getQuantity());
        inventoryPartRepository.save(part);

        BigDecimal currentTotal = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;
        BigDecimal partCost = part.getPrice().multiply(BigDecimal.valueOf(orderPart.getQuantity()));

        BigDecimal newTotal = currentTotal.subtract(partCost);
        order.setTotalPrice(newTotal.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newTotal);

        orderRepository.save(order);

        orderPartRepository.delete(orderPart);
    }
}
