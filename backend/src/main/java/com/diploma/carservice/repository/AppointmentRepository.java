package com.diploma.carservice.repository;

import com.diploma.carservice.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClientId(Long clientId);
    List<Appointment> findByCarOwnerId(Long ownerId);
}
