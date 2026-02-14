package com.diploma.carservice.controller;

import com.diploma.carservice.entity.Appointment;
import com.diploma.carservice.entity.enums.AppointmentStatus;
import com.diploma.carservice.security.UserDetailsImp;
import com.diploma.carservice.service.AppointmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public List<Appointment> getAll() {
        return service.getAllAppointments();
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('CLIENT')")
    public List<Appointment> getMyAppointments(@AuthenticationPrincipal UserDetailsImp userDetails) {
        return service.getMyAppointments(userDetails.getId());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CLIENT')")
    public Appointment create(@RequestBody Appointment appointment) {
        return service.createAppointment(appointment);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public Appointment updateStatus(@PathVariable Long id, @RequestParam AppointmentStatus status) {
        return service.updateStatus(id, status);
    }
}
