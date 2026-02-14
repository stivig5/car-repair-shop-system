package com.diploma.carservice.repository;

import com.diploma.carservice.entity.OrderPart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderPartRepository extends JpaRepository<OrderPart, Long> {}
