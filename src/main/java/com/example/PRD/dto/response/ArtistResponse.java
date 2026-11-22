package com.example.PRD.dto.response;

public record ArtistResponse(
        Long id,
        String stageName,
        String genre,
        Boolean active
) {}