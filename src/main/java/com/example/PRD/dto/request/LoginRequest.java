package com.example.PRD.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El identificador es obligatorio")
        String identifier, // Puede ser username o email

        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {}