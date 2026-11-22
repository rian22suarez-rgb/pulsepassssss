package com.example.PRD.dto.request;

import com.example.PRD.model.TicketType;

public record PurchaseTicketRequest(
        String userEmail,
        String eventCode,
        TicketType type
) {}