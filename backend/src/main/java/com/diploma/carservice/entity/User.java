package com.diploma.carservice.entity;

import com.diploma.carservice.entity.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@ToString
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nazwa użytkownika jest wymagana")
    @Size(min = 3, max = 50, message = "Nazwa użytkownika musi mieć od 3 do 50 znaków")
    @Column(unique=true)
    private String username;

    @NotBlank(message = "Hasło jest wymagane")
    @Size(min = 6, message = "Hasło musi mieć co najmniej 6 znaków")
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole userRole; // ADMIN, MECHANIC, CLIENT

    @NotBlank(message = "Imię i nazwisko jest wymagane")
    private String fullName;

    @Pattern(regexp = "^\\+?\\d{9,15}$", message = "Nieprawidłowy format numeru telefonu")
    private String phoneNumber;

    private Long telegramChatId;

    private LocalDateTime createdAt =  LocalDateTime.now();


    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Car> cars;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "mechanic")
    @JsonIgnore
    private List<Order> mechanicOrders;
}
