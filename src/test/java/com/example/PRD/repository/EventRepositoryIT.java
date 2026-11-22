package com.example.PRD.repository;

import com.example.PRD.TestcontainersConfiguration;
import com.example.PRD.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
class EventRepositoryIT {

    @Autowired private EventRepository eventRepository;
    @Autowired private VenueRepository venueRepository;

    private Venue venue;

    @BeforeEach
    void setUp() {
        venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setName("Marina Convention Center");
        venue.setCity("Santa Marta");
        venue.setAddress("Calle 1");
        venue.setCapacity(5000);
        venue.setActive(true);
        venueRepository.saveAndFlush(venue);
    }

    @Test
    void AC002_findEventByEventCodeWithVenue() {
        Event event = new Event(
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival anual",
                EventCategory.MUSIC,
                EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 8, 15, 20, 0),
                18,
                null,
                venue
        );
        eventRepository.saveAndFlush(event);

        Optional<Event> found = eventRepository.findByEventCode("CMF-2026");
        assertThat(found).isPresent();
        assertThat(found.get().getVenue().getCode()).isEqualTo("VEN-SMR-01");
    }

    @Test
    void FR_EVT_005_findPublishedOrderedByDate() {
        eventRepository.saveAndFlush(crearEvento("EVT-A", EventStatus.DRAFT, 1));
        eventRepository.saveAndFlush(crearEvento("EVT-B", EventStatus.PUBLISHED, 3));
        eventRepository.saveAndFlush(crearEvento("EVT-C", EventStatus.PUBLISHED, 2));
        eventRepository.saveAndFlush(crearEvento("EVT-D", EventStatus.CANCELLED, 4));

        List<Event> result = eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getEventCode()).isEqualTo("EVT-C");
        assertThat(result.get(1).getEventCode()).isEqualTo("EVT-B");
    }

    @Test
    void FR_VEN_004_findEventsByVenueCode() {
        eventRepository.saveAndFlush(crearEvento("EVT-VEN-1", EventStatus.PUBLISHED, 1));
        eventRepository.saveAndFlush(crearEvento("EVT-VEN-2", EventStatus.PUBLISHED, 2));

        List<Event> result = eventRepository.findByVenueCode("VEN-SMR-01");
        assertThat(result).hasSize(2);
    }

    private Event crearEvento(String code, EventStatus status, int dayOffset) {
        return new Event(
                code,
                "Evento " + code,
                "desc",
                EventCategory.MUSIC,
                status,
                LocalDateTime.of(2026, 8, dayOffset, 20, 0),
                18,
                null,
                venue
        );
    }
}