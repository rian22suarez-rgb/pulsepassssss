package com.example.PRD.service.impl;

import com.example.PRD.dto.request.PurchaseTicketRequest;
import com.example.PRD.dto.response.TicketResponse;
import com.example.PRD.exception.BusinessRuleException;
import com.example.PRD.exception.ResourceNotFoundException;
import com.example.PRD.mapper.TicketMapper;
import com.example.PRD.model.*;
import com.example.PRD.repository.EventRepository;
import com.example.PRD.repository.TicketRepository;
import com.example.PRD.repository.UserRepository;
import com.example.PRD.security.SecurityPrincipal;
import com.example.PRD.service.AuthorizationService;
import com.example.PRD.service.TicketService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;
    private final AuthorizationService authorizationService;   // ← NUEVO

    public TicketServiceImpl(TicketRepository ticketRepository,
                             UserRepository userRepository,
                             EventRepository eventRepository,
                             TicketMapper ticketMapper,
                             AuthorizationService authorizationService) {   // ← NUEVO
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    public TicketResponse purchase(PurchaseTicketRequest request) {
        SecurityPrincipal principal = authorizationService.currentPrincipal();

        // OWNERSHIP (SEC-006, SEC-007, T-SEC-010):
        // Si el rol del usuario es USER, solo puede comprar para su propio email.
        // ADMIN/STAFF pueden comprar para cualquiera (según PRD, sección 11.1).
        if (!principal.isAdmin() && !principal.isStaff()) {
            if (request.userEmail() == null
                    || !request.userEmail().equalsIgnoreCase(principal.getEmail())) {
                throw new AccessDeniedException(
                        "No tiene permisos para comprar tickets a nombre de otro usuario");
            }
        }

        User user = userRepository.findByEmailIgnoreCase(request.userEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userEmail()));
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BusinessRuleException("User is not active");
        }
        Event event = eventRepository.findByEventCode(request.eventCode())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + request.eventCode()));
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException("Event is not available for purchase. Status: " + event.getStatus());
        }
        if (!event.getEventDate().isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException("Event date has already passed");
        }
        if (event.getMinimumAge() != null && event.getMinimumAge() > 0) {
            UserProfile profile = user.getProfile();
            if (profile == null || profile.getBirthDate() == null) {
                throw new BusinessRuleException("User profile or birth date missing");
            }
            int ageAtEvent = Period.between(profile.getBirthDate(), event.getEventDate().toLocalDate()).getYears();
            if (ageAtEvent < event.getMinimumAge()) {
                throw new BusinessRuleException("User does not meet minimum age: " + event.getMinimumAge());
            }
        }
        long paidCount = ticketRepository.countByEventEventCodeAndStatus(event.getEventCode(), TicketStatus.PAID);
        int capacity = event.getVenue().getCapacity();
        if (paidCount >= capacity) {
            throw new BusinessRuleException("Event is sold out");
        }
        BigDecimal price = calculatePrice(request.type());

        Ticket ticket = new Ticket();
        ticket.setTicketCode("TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ticket.setType(request.type());
        ticket.setPrice(price);
        ticket.setStatus(TicketStatus.PAID);
        ticket.setPurchaseDate(LocalDateTime.now());
        ticket.setUser(user);
        ticket.setEvent(event);
        ticketRepository.save(ticket);

        if (paidCount + 1 >= capacity) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }
        return ticketMapper.toResponse(ticket);
    }

    private BigDecimal calculatePrice(TicketType type) {
        BigDecimal base = new BigDecimal("100000");
        return switch (type) {
            case GENERAL   -> base;
            case STUDENT   -> base.multiply(new BigDecimal("0.7"));
            case VIP       -> base.multiply(new BigDecimal("2.5"));
            case BACKSTAGE -> base.multiply(new BigDecimal("4.0"));
        };
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse findByCode(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));

        // OWNERSHIP: USER solo puede ver sus propios tickets (T-SEC-009).
        SecurityPrincipal principal = authorizationService.currentPrincipal();
        boolean isStaffOrAdmin = principal.isAdmin() || principal.isStaff();
        if (!isStaffOrAdmin && !ticket.getUser().getId().equals(principal.getId())) {
            throw new AccessDeniedException("No tiene permisos para acceder a este ticket");
        }
        return ticketMapper.toResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findByUserEmail(String email) {
        // OWNERSHIP: USER solo puede consultar sus propios tickets (T-SEC-015).
        authorizationService.assertCanAccessUserEmail(email);
        return ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(email)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findPaidTicketsByEvent(String eventCode) {
        // La anotación @PreAuthorize del controller ya garantiza STAFF/ADMIN.
        return ticketRepository.findByEventEventCodeAndStatus(eventCode, TicketStatus.PAID)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TicketResponse cancel(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));

        // OWNERSHIP: solo el dueño o ADMIN pueden cancelar (T-SEC-011).
        SecurityPrincipal principal = authorizationService.currentPrincipal();
        if (!principal.isAdmin() && !ticket.getUser().getId().equals(principal.getId())) {
            throw new AccessDeniedException("No tiene permisos para cancelar este ticket");
        }
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Only PAID tickets can be cancelled. Current: " + ticket.getStatus());
        }
        if (ticket.getEvent().getEventDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Cannot cancel after event date");
        }
        ticket.setStatus(TicketStatus.CANCELLED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {
        // La anotación @PreAuthorize del controller ya garantiza STAFF/ADMIN (T-SEC-012/013).
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Only PAID tickets can be marked as used. Current: " + ticket.getStatus());
        }
        ticket.setStatus(TicketStatus.USED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }
}