package com.diploma.carservice.repository;

import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByTelegramChatId(Long chatId);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByUsername(String admin);

    List<User> findByUserRole(UserRole userRole);

    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<User> searchByText(@Param("search") String search);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.cars WHERE u.telegramChatId = :chatId")
    Optional<User> findByTelegramChatIdWithCars(@Param("chatId") Long chatId);
}