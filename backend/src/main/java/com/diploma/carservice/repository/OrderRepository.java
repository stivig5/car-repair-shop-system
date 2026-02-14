package com.diploma.carservice.repository;

import com.diploma.carservice.entity.Order;
import com.diploma.carservice.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByMechanicId(Long mechanicId);
    List<Order> findByCarOwnerId(Long ownerId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.tasks WHERE o.car.owner.id = :ownerId ORDER BY o.createDate DESC")
    List<Order> findByCarOwnerIdWithTasks(@Param("ownerId") Long ownerId);

    @Query("SELECT o FROM Order o WHERE " +
            "(:status IS NULL OR o.status = :status) AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(o.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.car.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.car.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.car.licPlate) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(o.car.owner.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Order> searchOrders(@Param("search") String search, @Param("status") OrderStatus status);
}