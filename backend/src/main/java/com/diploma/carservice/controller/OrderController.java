package com.diploma.carservice.controller;

import com.diploma.carservice.entity.Order;
import com.diploma.carservice.entity.OrderPart;
import com.diploma.carservice.entity.OrderTask;
import com.diploma.carservice.entity.enums.OrderStatus;
import com.diploma.carservice.service.OrderPartService;
import com.diploma.carservice.service.OrderService;
import com.diploma.carservice.service.OrderTaskService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderPartService orderPartService;
    private final OrderTaskService orderTaskService;

    public OrderController(OrderService orderService, OrderPartService orderPartService, OrderTaskService orderTaskService) {
        this.orderService = orderService;
        this.orderPartService = orderPartService;
        this.orderTaskService = orderTaskService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Order> getAllOrders(@RequestParam(required = false) String search,
                                    @RequestParam(required = false) OrderStatus status) {
        return orderService.getAllOrders(search, status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public Order createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public Order updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }

    @PutMapping("/{id}/mechanic")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public Order assignMechanic(@PathVariable Long id, @RequestParam Long mechanicId) {
        return orderService.assignMechanic(id, mechanicId);
    }

    @PostMapping("/{id}/tasks")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public OrderTask addTask(@PathVariable Long id, @RequestBody OrderTask task) {
        return orderTaskService.createTask(id, task);
    }

    @PutMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public OrderTask updateTask(@PathVariable Long taskId, @RequestBody OrderTask task) {
        return orderTaskService.updateTask(taskId, task);
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public OrderPart addPart(@PathVariable Long id, @RequestParam Long partId, @RequestParam int quantity) {
        return orderPartService.addPartToOrder(id, partId, quantity);
    }

    @DeleteMapping("/parts/{partId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public void removePart(@PathVariable Long partId) {
        orderPartService.removePartFromOrder(partId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }
}