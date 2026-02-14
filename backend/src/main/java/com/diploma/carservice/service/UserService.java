package com.diploma.carservice.service;

import com.diploma.carservice.entity.Order;
import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.UserRole;
import com.diploma.carservice.repository.OrderRepository;
import com.diploma.carservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private UserRepository userRepository;
    private OrderRepository orderRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.orderRepository = orderRepository;
    }

    public List<User> findAllUsers(String search, UserRole role) {
        if (search != null && !search.isEmpty()) {
            return userRepository.searchByText(search);
        }
        if (role != null) {
            return userRepository.findByUserRole(role);
        }
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        if (user.getUserRole() == null) {
            user.setUserRole(UserRole.CLIENT);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(userDetails.getFullName());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setTelegramChatId(userDetails.getTelegramChatId());
        user.setUsername(userDetails.getUsername());

        if (userDetails.getUserRole() != null) {
            user.setUserRole(userDetails.getUserRole());
        }

        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUserRole() == UserRole.MECHANIC) {
            List<Order> orders = orderRepository.findByMechanicId(id);
            for (Order order : orders) {
                order.setMechanic(null);
                orderRepository.save(order);
            }
        }

        userRepository.deleteById(id);
    }

    public User changeRole(Long id, UserRole newRole) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setUserRole(newRole);
        return userRepository.save(user);
    }
}
