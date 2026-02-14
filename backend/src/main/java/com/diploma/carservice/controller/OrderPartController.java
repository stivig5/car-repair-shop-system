package com.diploma.carservice.controller;

import com.diploma.carservice.entity.OrderPart;
import com.diploma.carservice.service.OrderPartService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-parts")
@CrossOrigin(origins = "*")
public class OrderPartController {
    private OrderPartService orderPartService;

    public OrderPartController(OrderPartService orderPartService) {
        this.orderPartService = orderPartService;
    }

    @GetMapping
    public List<OrderPart> getAll() {
        return orderPartService.getAllOrderParts();
    }

    @PostMapping
    public OrderPart add(@RequestParam Long orderId, @RequestParam Long partId, @RequestParam int quantity) {
        return orderPartService.addPartToOrder(orderId, partId, quantity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderPartService.removePartFromOrder(id);
    }
}
