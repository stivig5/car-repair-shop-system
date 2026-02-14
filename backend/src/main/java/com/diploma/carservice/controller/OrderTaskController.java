package com.diploma.carservice.controller;

import com.diploma.carservice.entity.OrderTask;
import com.diploma.carservice.service.OrderTaskService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class OrderTaskController {

    private final OrderTaskService service;

    public OrderTaskController(OrderTaskService service) {
        this.service = service;
    }

    @GetMapping
    public List<OrderTask> getAll() {
        return service.getAllTasks();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public OrderTask add(@RequestBody OrderTask task, @RequestParam Long orderId) {
        return service.createTask(orderId, task);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public OrderTask update(@PathVariable Long id, @RequestBody OrderTask task) {
        return service.updateTask(id, task);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public void delete(@PathVariable Long id) {
        service.deleteTask(id);
    }
}
