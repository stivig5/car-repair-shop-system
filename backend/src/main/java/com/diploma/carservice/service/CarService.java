package com.diploma.carservice.service;

import com.diploma.carservice.entity.Car;
import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.CarStatus;
import com.diploma.carservice.entity.enums.UserRole;
import com.diploma.carservice.repository.CarRepository;
import com.diploma.carservice.repository.UserRepository;
import com.diploma.carservice.security.UserDetailsImp;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public CarService(CarRepository carRepository, UserRepository userRepository) {
        this.carRepository = carRepository;
        this.userRepository = userRepository;
    }

    private UserDetailsImp getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImp) {
            return (UserDetailsImp) auth.getPrincipal();
        }
        return null;
    }

    public Car getCarById(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found with id: " + id));
    }

    public List<Car> getAllCars(String search) {
        if (search != null && !search.isEmpty()) {
            return carRepository.searchCars(search);
        }
        return carRepository.findAll();
    }

    public List<Car> getCarsByOwner(Long ownerId) {
        return carRepository.findByOwnerId(ownerId);
    }

    public Car addCar(Car car, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        car.setOwner(owner);
        if (car.getStatus() == null) {
            car.setStatus(CarStatus.AVAILABLE);
        }
        return carRepository.save(car);
    }

    public Car updateCar(Long id, Car carDetails) {
        return carRepository.findById(id)
                .map(car -> {
                    car.setBrand(carDetails.getBrand());
                    car.setModel(carDetails.getModel());
                    car.setYear(carDetails.getYear());
                    car.setLicPlate(carDetails.getLicPlate());
                    if (carDetails.getStatus() != null) {
                        car.setStatus(carDetails.getStatus());
                    }

                    if (carDetails.getOwner() != null && carDetails.getOwner().getId() != null) {
                        User newOwner = userRepository.findById(carDetails.getOwner().getId())
                                .orElseThrow(() -> new RuntimeException("Owner not found"));
                        car.setOwner(newOwner);
                    }
                    return carRepository.save(car);
                })
                .orElseThrow(() -> new RuntimeException("Car not found with id: " + id));
    }

    public void deleteCar(Long id) {
        carRepository.deleteById(id);
    }
}
