package com.diploma.carservice.repository;

import com.diploma.carservice.entity.InventoryPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryPartRepository extends JpaRepository<InventoryPart, Long> {
    @Query("SELECT p FROM InventoryPart p WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<InventoryPart> searchParts(@Param("search") String search);
}
