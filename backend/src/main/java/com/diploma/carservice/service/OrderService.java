package com.diploma.carservice.service;

import com.diploma.carservice.entity.*;
import com.diploma.carservice.entity.enums.OrderStatus;
import com.diploma.carservice.entity.enums.UserRole;
import com.diploma.carservice.repository.*;
import com.diploma.carservice.security.UserDetailsImp;
import com.diploma.carservice.service.telegram.TelegramBotService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderTaskRepository taskRepository;
    private final OrderPartRepository orderPartRepository;
    private final InventoryPartRepository inventoryPartRepository;
    private final InventoryPartService inventoryService;
    private final UserRepository userRepository;
    private final TelegramBotService telegramBotService;

    public OrderService(OrderRepository orderRepository, OrderTaskRepository taskRepository,
                        OrderPartRepository orderPartRepository, InventoryPartRepository inventoryPartRepository,
                        InventoryPartService inventoryService, UserRepository userRepository, TelegramBotService telegramBotService) {
        this.orderRepository = orderRepository;
        this.taskRepository = taskRepository;
        this.orderPartRepository = orderPartRepository;
        this.inventoryPartRepository = inventoryPartRepository;
        this.inventoryService = inventoryService;
        this.userRepository = userRepository;
        this.telegramBotService = telegramBotService;
    }

    private UserDetailsImp getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImp) {
            return (UserDetailsImp) auth.getPrincipal();
        }
        return null;
    }

    public List<Order> getAllOrders(String search, OrderStatus status) {
        UserDetailsImp user = getCurrentUser();

        if (user != null && user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(UserRole.CLIENT.name()))) {
            return orderRepository.findByCarOwnerId(user.getId());
        }

        if (user != null && user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(UserRole.MECHANIC.name()))) {
            return orderRepository.findByMechanicId(user.getId());
        }

        return orderRepository.searchOrders(search, status);
    }

    public Order createOrder(Order order) {
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.NEW);
        }
        order.setCreateDate(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Order updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean statusChanged = !order.getStatus().equals(status);

        order.setStatus(status);
        if (status == OrderStatus.COMPLETED) {
            order.setEndDate(LocalDateTime.now());
        }

        Order savedOrder = orderRepository.save(order);

        if (statusChanged && savedOrder.getCar().getOwner() != null) {
            Long telegramChatId = savedOrder.getCar().getOwner().getTelegramChatId();

            if (telegramChatId != null) {
                String carInfo = savedOrder.getCar().getBrand() + " " + savedOrder.getCar().getModel();

                String message = String.format(
                        "🔧 <b>Aktualizacja Zlecenia #%d</b>\n" +
                                "Pojazd: %s\n" +
                                "Nowy status: <b>%s</b>",
                        savedOrder.getId(),
                        carInfo,
                        status
                );

                try {
                    telegramBotService.sendDirectMessage(telegramChatId.toString(), message);
                } catch (Exception e) {
                    System.err.println("Nie udało się wysłać powiadomienia Telegram: " + e.getMessage());
                }
            }
        }
        return savedOrder;
    }

    public Order assignMechanic(Long orderId, Long mechanicId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        User mechanic = userRepository.findById(mechanicId).orElseThrow(() -> new RuntimeException("Mechanic not found"));
        order.setMechanic(mechanic);
        return orderRepository.save(order);
    }

    public void createOrderFromAppointment(Appointment app) {
        if (app.getCar() == null) {
            throw new RuntimeException("Cannot create order: Appointment has no car assigned.");
        }

        Order order = new Order();
        order.setCar(app.getCar());
        order.setMechanic(null);
        order.setStatus(OrderStatus.NEW);

        order.setDescription("Wizyta z dn. " + app.getRequestedDate().toLocalDate() + ": " + app.getDescription());
        order.setCreateDate(LocalDateTime.now());

        orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
}