package com.diploma.carservice.service;

import com.diploma.carservice.entity.Appointment;
import com.diploma.carservice.entity.Order;
import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.AppointmentStatus;
import com.diploma.carservice.entity.enums.OrderStatus;
import com.diploma.carservice.repository.AppointmentRepository;
import com.diploma.carservice.repository.OrderRepository;
import com.diploma.carservice.service.telegram.TelegramBotService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final OrderRepository orderRepository;
    private final TelegramBotService botService;
    private final OrderService orderService;

    public AppointmentService(AppointmentRepository appointmentRepository, OrderRepository orderRepository, TelegramBotService botService,  OrderService orderService) {
        this.appointmentRepository = appointmentRepository;
        this.orderRepository = orderRepository;
        this.botService = botService;
        this.orderService = orderService;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getMyAppointments(Long clientId) {
        return appointmentRepository.findByClientId(clientId);
    }

    public Appointment createAppointment(Appointment appointment) {
        appointment.setStatus(AppointmentStatus.REQUESTED);
        return appointmentRepository.save(appointment);
    }

    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono wizyty"));

        appointment.setStatus(status);
        Appointment saved = appointmentRepository.save(appointment);

        if (status == AppointmentStatus.CONFIRMED) {

            try {
                orderService.createOrderFromAppointment(saved); //
            } catch (Exception e) {
                System.err.println("Błąd podczas tworzenia zlecenia z wizyty: " + e.getMessage());
            }

            User client = saved.getClient();
            if (client != null && client.getTelegramChatId() != null) {
                String message = "✅ Twoja wizyta (ID: " + saved.getId() + ") została potwierdzona przez serwis!";

                botService.sendDirectMessage(client.getTelegramChatId().toString(), message); //
            }
        }

        return saved;
    }

    private String translateStatusToPolish(AppointmentStatus status) {
        if (status == null) return "Nieznany";
        switch (status) {
            case REQUESTED: return "⏳ Oczekuje na zatwierdzenie";
            case CONFIRMED: return "✅ Potwierdzona";
            case REJECTED:  return "❌ Odrzucona / Anulowana";
            case COMPLETED: return "🏁 Zakończona";
            default: return status.name();
        }
    }
}