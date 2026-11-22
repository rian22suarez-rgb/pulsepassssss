package com.example.PRD.controller;

import com.example.PRD.dto.request.RegisterUserRequest;
import com.example.PRD.dto.response.UserResponse;
import com.example.PRD.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        // Público: registro
        UserResponse createdUser = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping("/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> findByUsername(@PathVariable String username) {
        // Ownership: el Service debe validar que username coincida con el principal,
        // salvo que sea ADMIN. Eso se implementa en la etapa 7.
        return ResponseEntity.ok(userService.findByUsername(username));
    }
}