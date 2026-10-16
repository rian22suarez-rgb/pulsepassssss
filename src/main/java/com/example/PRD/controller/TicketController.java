package com.example.PRD.controller;

import com.example.PRD.dto.request.PurchaseTicketRequest;
import com.example.PRD.dto.response.TicketResponse;
import com.example.PRD.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> purchase(@Valid @RequestBody PurchaseTicketRequest request) {
        TicketResponse purchasedTicket = ticketService.purchase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(purchasedTicket);
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(@PathVariable String email) {
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }
}