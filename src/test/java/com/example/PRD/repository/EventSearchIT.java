package com.example.PRD.repository;

import com.example.PRD.TestcontainersConfiguration;
import com.example.PRD.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
class EventSearchIT {

    @Autowired private EventRepository eventRepository;
    @Autowired private VenueRepository venueRepository;
    @Autowired private ArtistRepository artistRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TicketRepository ticketRepository;

    private Venue santaMarta;
    private Artist solar;

    @BeforeEach
    void setUp() {
        santaMarta = new Venue();
        santaMarta.setCode("VEN-SMR-01");
        santaMarta.setName("Marina Convention Center");
        santaMarta.setCity("Santa Marta");
        santaMarta.setAddress("Calle 1");
        santaMarta.setCapacity(5000);
        santaMarta.setActive(true);
        venueRepository.saveAndFlush(santaMarta);

        solar = artistRepository.findByStageName("Solar Beat").orElseThrow();
    }

    @Test
    void AC007_findEventsByArtistWithoutDuplicates() {
        Event e1 = new Event("EVT-1", "E1", "d", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 1, 1, 20, 0), 0, null, santaMarta);
        Event e2 = new Event("EVT-2", "E2", "d", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 2, 1, 20, 0), 0, null, santaMarta);
        e1.addArtist(solar);
        e2.addArtist(solar);
        eventRepository.saveAndFlush(e1);
        eventRepository.saveAndFlush(e2);

        List<Event> result = eventRepository.findByArtistStageName("Solar Beat");
        assertThat(result).hasSize(2);
    }

    @Test
    void FR_SRC_002_findEventsByCityAndArtist() {
        Event e1 = new Event("EVT-1", "E1", "d", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 1, 1, 20, 0), 0, null, santaMarta);
        e1.addArtist(solar);
        eventRepository.saveAndFlush(e1);

        List<Event> result = eventRepository.findByCityAndArtist("Santa Marta", "Solar Beat");
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEventCode()).isEqualTo("EVT-1");
    }

    @Test
    void AC008_countOnlyPaidTicketsForEvent() {
        User u = new User();
        u.setUsername("u1");
        u.setEmail("u1@example.com");
        u.setActive(true);
        userRepository.saveAndFlush(u);

        Event e = new Event("EVT-AC008", "Evento", "d", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 3, 1, 20, 0), 0, null, santaMarta);
        eventRepository.saveAndFlush(e);

        crearTicket("T1", TicketStatus.PAID, u, e);
        crearTicket("T2", TicketStatus.PAID, u, e);
        crearTicket("T3", TicketStatus.RESERVED, u, e);
        crearTicket("T4", TicketStatus.CANCELLED, u, e);

        long count = ticketRepository.countByEventCodeAndStatus("EVT-AC008", TicketStatus.PAID);
        assertThat(count).isEqualTo(2);
    }

    private void crearTicket(String code, TicketStatus status, User user, Event event) {
        Ticket t = new Ticket();
        t.setTicketCode(code);
        t.setType(TicketType.GENERAL);
        t.setPrice(new BigDecimal("120000"));
        t.setStatus(status);
        t.setPurchaseDate(LocalDateTime.now());
        t.setUser(user);
        t.setEvent(event);
        ticketRepository.saveAndFlush(t);
    }
}