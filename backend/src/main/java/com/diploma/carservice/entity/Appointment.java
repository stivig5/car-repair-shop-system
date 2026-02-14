package com.diploma.carservice.entity;

import com.diploma.carservice.entity.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User client;

    @ManyToOne
    @JoinColumn(name = "car_id")
    private Car car;

    private LocalDateTime requestedDate;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    private String description;
}
