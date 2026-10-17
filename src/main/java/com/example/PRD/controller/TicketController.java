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
        TicketResponse purchasedTicket = ticketService.purchase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(purchasedTicket);
    }

    @GetMapping("/user/{email}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(@PathVariable String email) {
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }

    // ═══════════════════════════════════════════════════════════════
    // NUEVOS ENDPOINTS — necesarios para el Escenario 8 y 11.1 del PRD
    // ═══════════════════════════════════════════════════════════════

    /**
     * FR-SEC-TKT-01: consultar un ticket por código.
     * Ownership: USER solo sus tickets, STAFF/ADMIN pueden ver cualquiera.
     */
    @GetMapping("/{ticketCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponse> findByCode(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.findByCode(ticketCode));
    }

    /**
     * FR-SEC-TKT-05: cancelar un ticket.
     * Ownership: USER solo puede cancelar sus tickets, ADMIN puede cualquiera.
     */
    @PatchMapping("/{ticketCode}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TicketResponse> cancel(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.cancel(ticketCode));
    }

    /**
     * FR-SEC-TKT-06: marcar un ticket como usado (control de acceso).
     * Solo STAFF o ADMIN. Preserva la transición válida del Service.
     */
    @PatchMapping("/{ticketCode}/use")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<TicketResponse> markAsUsed(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.markAsUsed(ticketCode));
    }

    /**
     * FR-SEC-TKT-04: consultar tickets pagados de un evento.
     * Solo STAFF o ADMIN.
     */
    @GetMapping("/event/{eventCode}/paid")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<TicketResponse>> findPaidTicketsByEvent(@PathVariable String eventCode) {
        return ResponseEntity.ok(ticketService.findPaidTicketsByEvent(eventCode));
    }
}