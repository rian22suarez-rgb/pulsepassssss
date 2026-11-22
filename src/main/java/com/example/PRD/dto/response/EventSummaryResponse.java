package com.example.PRD.dto.response;

import com.example.PRD.model.EventStatus;
import java.time.LocalDateTime;

public record EventSummaryResponse(
        String eventCode,
        String name,
        EventStatus status,
        LocalDateTime eventDate,
        String venueName
) {}