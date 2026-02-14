package com.diploma.carservice.controller;

import com.diploma.carservice.entity.Car;
import com.diploma.carservice.security.UserDetailsImp;
import com.diploma.carservice.service.CarService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "*")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public List<Car> getAllCars(@RequestParam(required = false) String search) {
        return carService.getAllCars(search);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('CLIENT')")
    public List<Car> getMyCars(@AuthenticationPrincipal UserDetailsImp userDetails) {
        return carService.getCarsByOwner(userDetails.getId());
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC', 'CLIENT')")
    public List<Car> getByOwner(@PathVariable Long ownerId) {
        return carService.getCarsByOwner(ownerId);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CLIENT', 'MECHANIC')")
    public Car addCar(@RequestBody Car car,
                      @RequestParam(required = false) Long ownerId,
                      @AuthenticationPrincipal UserDetailsImp userDetails) {

        boolean isStaff = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN") || a.getAuthority().equals("MECHANIC"));

        if (!isStaff || ownerId == null) {
            return carService.addCar(car, userDetails.getId());
        }

        return carService.addCar(car, ownerId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC', 'CLIENT')")
    public Car updateCar(@PathVariable Long id, @RequestBody Car car, @AuthenticationPrincipal UserDetailsImp userDetails) {
        boolean isClient = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("CLIENT"));

        if (isClient) {
            Car existingCar = carService.getCarById(id);
            if (!existingCar.getOwner().getId().equals(userDetails.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie możesz edytować cudzego pojazdu");
            }
            car.setStatus(null);
            car.setOwner(null);
        }

        return carService.updateCar(id, car);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CLIENT')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImp userDetails) {
        boolean isClient = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("CLIENT"));

        if (isClient) {
            Car existingCar = carService.getCarById(id);
            if (!existingCar.getOwner().getId().equals(userDetails.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nie możesz usunąć cudzego pojazdu");
            }
        }
        carService.deleteCar(id);
    }
}
