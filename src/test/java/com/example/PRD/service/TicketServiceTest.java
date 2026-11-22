package com.example.PRD.service;

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
import com.example.PRD.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private UserRepository userRepository;
    @Mock private EventRepository eventRepository;
    @Mock private TicketMapper ticketMapper;
    @Mock private AuthorizationService authorizationService;   // ← NUEVO

    @InjectMocks private TicketServiceImpl ticketService;

    private User activeAdult;
    private Event publishedEvent;
    private Venue venue;
    private PurchaseTicketRequest request;
    private SecurityPrincipal ownerPrincipal;   // ← NUEVO

    @BeforeEach
    void setUp() {
        UserProfile profile = new UserProfile();
        profile.setBirthDate(LocalDate.of(2000, 1, 1));

        activeAdult = new User();
        activeAdult.setId(1L);
        activeAdult.setUsername("andrea");
        activeAdult.setEmail("andrea@email.com");
        activeAdult.setActive(true);
        activeAdult.setProfile(profile);

        venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setCapacity(3);
        venue.setActive(true);

        publishedEvent = new Event();
        publishedEvent.setEventCode("CMF-2026");
        publishedEvent.setName("Caribbean Music Fest 2026");
        publishedEvent.setStatus(EventStatus.PUBLISHED);
        publishedEvent.setEventDate(LocalDateTime.now().plusMonths(2));
        publishedEvent.setMinimumAge(18);
        publishedEvent.setVenue(venue);

        request = new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.VIP);

        // Principal que representa al usuario dueño del email
        ownerPrincipal = new SecurityPrincipal(
                1L, "andrea", "andrea@email.com", "hash", true, Set.of("USER"));
    }

    // ─── Helper: hace que el principal sea el dueño ─────────────────
    private void stubPrincipalAsOwner() {
        when(authorizationService.currentPrincipal()).thenReturn(ownerPrincipal);
    }

    // ═══════════════════════════════════════════════════════════════
    // PURCHASE
    // ═══════════════════════════════════════════════════════════════

    @Test // TEST-TICKET-001
    void purchase_valid_createsPaidTicket() {
        stubPrincipalAsOwner();
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdult));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(publishedEvent));
        when(ticketRepository.countByEventEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(0L);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(mock(TicketResponse.class));

        ticketService.purchase(request);

        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test // TEST-TICKET-002
    void purchase_userNotFound_throws() {
        stubPrincipalAsOwner();
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(ticketRepository, never()).save(any());
    }

    @Test // TEST-TICKET-003
    void purchase_inactiveUser_throws() {
        stubPrincipalAsOwner();
        activeAdult.setActive(false);
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdult));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class);

        verify(ticketRepository, never()).save(any());
    }

    @Test // TEST-TICKET-004
    void purchase_eventDraft_throws() {
        stubPrincipalAsOwner();
        publishedEvent.setStatus(EventStatus.DRAFT);
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdult));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(publishedEvent));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test // TEST-TICKET-006
    void purchase_underage_throws() {
        stubPrincipalAsOwner();
        UserProfile teenProfile = new UserProfile();
        teenProfile.setBirthDate(LocalDate.now().minusYears(17));
        activeAdult.setProfile(teenProfile);

        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdult));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(publishedEvent));

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("minimum age");
    }

    @Test // TEST-TICKET-007
    void purchase_noCapacity_throws() {
        stubPrincipalAsOwner();
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdult));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(publishedEvent));
        when(ticketRepository.countByEventEventCodeAndStatus("CMF-2026", TicketStatus.PAID))
                .thenReturn((long) venue.getCapacity());

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("sold out");
    }

    @Test // TEST-TICKET-008
    void purchase_lastTicket_setsEventToSoldOut() {
        stubPrincipalAsOwner();
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdult));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(publishedEvent));
        when(ticketRepository.countByEventEventCodeAndStatus("CMF-2026", TicketStatus.PAID))
                .thenReturn((long) (venue.getCapacity() - 1));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(mock(TicketResponse.class));

        ticketService.purchase(request);

        assertThat(publishedEvent.getStatus()).isEqualTo(EventStatus.SOLD_OUT);
        verify(eventRepository).save(publishedEvent);
    }

    @Test // TEST-TICKET-013 (NUEVO — anti-IDOR)
    void purchase_emailOfOtherUser_throwsAccessDenied() {
        // Principal es andrea; el request es para otro email → debe lanzar AccessDeniedException
        when(authorizationService.currentPrincipal()).thenReturn(ownerPrincipal);
        PurchaseTicketRequest requestForOther = new PurchaseTicketRequest(
                "carlos@email.com", "CMF-2026", TicketType.GENERAL);

        assertThatThrownBy(() -> ticketService.purchase(requestForOther))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);

        verify(ticketRepository, never()).save(any());
    }

    // ═══════════════════════════════════════════════════════════════
    // CANCEL
    // ═══════════════════════════════════════════════════════════════

    @Test // TEST-TICKET-009
    void cancel_paid_becomesCancelled() {
        Ticket ticket = new Ticket();
        ticket.setTicketCode("TCK-0001");
        ticket.setStatus(TicketStatus.PAID);
        ticket.setEvent(publishedEvent);
        ticket.setUser(activeAdult);   // ← dueño

        stubPrincipalAsOwner();
        when(ticketRepository.findByTicketCode("TCK-0001")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(mock(TicketResponse.class));

        ticketService.cancel("TCK-0001");

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.CANCELLED);
    }

    @Test // TEST-TICKET-010
    void cancel_used_throws() {
        Ticket ticket = new Ticket();
        ticket.setTicketCode("TCK-0001");
        ticket.setStatus(TicketStatus.USED);
        ticket.setUser(activeAdult);

        stubPrincipalAsOwner();
        when(ticketRepository.findByTicketCode("TCK-0001")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.cancel("TCK-0001"))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test // TEST-TICKET-014 (NUEVO — anti-IDOR)
    void cancel_ticketOfOtherUser_throwsAccessDenied() {
        User other = new User();
        other.setId(2L);
        other.setUsername("carlos");
        other.setEmail("carlos@email.com");

        Ticket ticket = new Ticket();
        ticket.setTicketCode("TCK-0001");
        ticket.setStatus(TicketStatus.PAID);
        ticket.setEvent(publishedEvent);
        ticket.setUser(other);

        stubPrincipalAsOwner();   // principal es andrea (id=1), ticket es de carlos (id=2)
        when(ticketRepository.findByTicketCode("TCK-0001")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.cancel("TCK-0001"))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);

        verify(ticketRepository, never()).save(any());
    }

    // ═══════════════════════════════════════════════════════════════
    // MARK AS USED
    // ═══════════════════════════════════════════════════════════════

    @Test // TEST-TICKET-011
    void markAsUsed_paid_becomesUsed() {
        Ticket ticket = new Ticket();
        ticket.setTicketCode("TCK-0001");
        ticket.setStatus(TicketStatus.PAID);
        ticket.setEvent(publishedEvent);

        when(ticketRepository.findByTicketCode("TCK-0001")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(mock(TicketResponse.class));

        ticketService.markAsUsed("TCK-0001");

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.USED);
    }

    @Test // TEST-TICKET-012
    void markAsUsed_cancelled_throws() {
        Ticket ticket = new Ticket();
        ticket.setTicketCode("TCK-0001");
        ticket.setStatus(TicketStatus.CANCELLED);

        when(ticketRepository.findByTicketCode("TCK-0001")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.markAsUsed("TCK-0001"))
                .isInstanceOf(BusinessRuleException.class);
    }
}