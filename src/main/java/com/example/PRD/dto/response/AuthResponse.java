package com.example.PRD.dto.response;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {}