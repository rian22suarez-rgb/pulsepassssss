package com.example.PRD.dto.response;

import java.util.List;

public record AuthenticatedUserResponse(
        Long id,
        String username,
        String email,
        List<String> roles
) {}