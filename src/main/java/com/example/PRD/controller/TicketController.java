package com.example.PRD.controller;

import com.example.PRD.dto.request.PurchaseTicketRequest;
import com.example.PRD.dto.response.TicketResponse;
import com.example.PRD.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponse> purchase(@Valid @RequestBody PurchaseTicketRequest request) {
        // Ownership: el Service debe validar que request.userEmail coincida con el principal
        // (si el rol es USER). Un ADMIN puede comprar para cualquiera.
        TicketResponse purchasedTicket = ticketService.purchase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(purchasedTicket);
    }

    @GetMapping("/user/{email}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(@PathVariable String email) {
        // Ownership: el Service debe validar que email coincida con el principal
        // (si el rol es USER). Un ADMIN/STAFF puede consultar cualquier email.
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }
}