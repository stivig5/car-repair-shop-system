package com.diploma.carservice.controller;

import com.diploma.carservice.entity.User;
import com.diploma.carservice.entity.enums.UserRole;
import com.diploma.carservice.security.UserDetailsImp;
import com.diploma.carservice.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<User> getAll(@RequestParam(required = false) String search,
                             @RequestParam(required = false) UserRole role) {
        return userService.findAllUsers(search, role);
    }

    @GetMapping("/mechanics")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public List<User> getMechanics() {
        return userService.findAllUsers(null, UserRole.MECHANIC);
    }

    @GetMapping("/clients")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public List<User> getClients() {
        return userService.findAllUsers(null, UserRole.CLIENT);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public User create(@RequestBody User user, @AuthenticationPrincipal UserDetailsImp userDetails) {
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public User update(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public User changeRole(@PathVariable Long id, @RequestParam UserRole role) {
        return userService.changeRole(id, role);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void delete(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
