package com.diploma.carservice.service;

import com.diploma.carservice.entity.Car;
import com.diploma.carservice.entity.Order;
import com.diploma.carservice.entity.OrderTask;
import com.diploma.carservice.entity.enums.CarStatus;
import com.diploma.carservice.entity.enums.OrderStatus;
import com.diploma.carservice.repository.CarRepository;
import com.diploma.carservice.repository.OrderRepository;
import com.diploma.carservice.repository.OrderTaskRepository;
import com.diploma.carservice.service.telegram.TelegramBotService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderTaskService {

    private final OrderTaskRepository taskRepository;
    private final OrderRepository orderRepository;
    private final CarRepository carRepository;
    private final TelegramBotService telegramBotService;

    public OrderTaskService(OrderTaskRepository taskRepository,
                            OrderRepository orderRepository,
                            CarRepository carRepository,
                            TelegramBotService telegramBotService) {
        this.taskRepository = taskRepository;
        this.orderRepository = orderRepository;
        this.carRepository = carRepository;
        this.telegramBotService = telegramBotService;
    }

    public List<OrderTask> getAllTasks() {
        return taskRepository.findAll();
    }

    public OrderTask createTask(Long orderId, OrderTask task) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        task.setOrder(order);

        if (task.getStatus() == null) {
            task.setStatus("IN_PROGRESS");
        }
        return taskRepository.save(task);
    }

    @Transactional
    public OrderTask updateTask(Long id, OrderTask updatedTask) {
        OrderTask task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTaskName(updatedTask.getTaskName());
        task.setPrice(updatedTask.getPrice());

        if (updatedTask.getStatus() != null) {
            task.setStatus(updatedTask.getStatus());
        }

        OrderTask savedTask = taskRepository.save(task);

        checkOrderCompletion(savedTask.getOrder().getId());

        return savedTask;
    }

    private void checkOrderCompletion(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderTask> tasks = order.getTasks();

        boolean allDone = !tasks.isEmpty() && tasks.stream()
                .allMatch(t -> "DONE".equals(t.getStatus()));

        if (allDone) {
            order.setStatus(OrderStatus.COMPLETED);
            order.setEndDate(LocalDateTime.now());

            Order savedOrder = orderRepository.save(order);

            Car car = order.getCar();
            if (car != null) {
                car.setStatus(CarStatus.AVAILABLE);
                carRepository.save(car);

                if (car.getOwner() != null && car.getOwner().getTelegramChatId() != null) {
                    String message = String.format(
                            "✅ <b>Zlecenie #%d Zakończone!</b>\n" +
                                    "Auto: %s %s\n" +
                                    "Wszystkie naprawy zostały wykonane. Zapraszamy po odbiór.",
                            savedOrder.getId(),
                            car.getBrand(), car.getModel()
                    );

                    try {
                        telegramBotService.sendDirectMessage(
                                car.getOwner().getTelegramChatId().toString(),
                                message
                        );
                    } catch (Exception e) {
                        System.err.println("Błąd wysyłania powiadomienia Telegram: " + e.getMessage());
                    }
                }
                // ---------------------------------------------------
            }
        } else {
            if (order.getStatus() == OrderStatus.COMPLETED) {
                order.setStatus(OrderStatus.IN_PROGRESS);
                order.setEndDate(null);
                orderRepository.save(order);

                Car car = order.getCar();
                if (car != null) {
                    car.setStatus(CarStatus.IN_SERVICE);
                    carRepository.save(car);
                }
            }
        }
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
