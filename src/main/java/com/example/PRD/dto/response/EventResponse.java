package com.example.PRD.dto.response;

import com.example.PRD.model.EventCategory;
import com.example.PRD.model.EventStatus;
import java.time.LocalDateTime;
import java.util.List;

public record EventResponse(
        Long id,
        String eventCode,
        String name,
        String description,
        EventCategory category,
        EventStatus status,
        LocalDateTime eventDate,
        Integer minimumAge,
        String streamingUrl,
        String venueCode,
        String venueName,
        List<ArtistResponse> artists // <-- NUEVO CAMPO AQUÍ
) {}