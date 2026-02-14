package com.diploma.carservice.entity;

import com.diploma.carservice.entity.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "car_id")
    private Car car;

    @ManyToOne
    @JoinColumn(name = "mechanic_id")
    private User mechanic;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private String description;
    private BigDecimal totalPrice;

    private LocalDateTime createDate = LocalDateTime.now();
    private LocalDateTime updateDate;
    private LocalDateTime endDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderTask> tasks;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderPart> parts;
}