package com.diploma.carservice.repository;

import com.diploma.carservice.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CarRepository extends JpaRepository<Car, Long> {
    List<Car> findByOwnerId(Long userId);

    @Query("SELECT c FROM Car c WHERE " +
            "LOWER(c.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.licPlate) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Car> searchCars(@Param("search") String search);
    @Query("SELECT DISTINCT c FROM Car c JOIN c.orders o WHERE o.mechanic.id = :mechanicId")
    List<Car> findCarsByAssignedMechanicId(@Param("mechanicId") Long mechanicId);
}
