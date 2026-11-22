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

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
class EventArtistIT {

    @Autowired private EventRepository eventRepository;
    @Autowired private VenueRepository venueRepository;
    @Autowired private ArtistRepository artistRepository;

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
    void AC003_eventWithThreeArtistsPersistsWithoutDuplicates() {
        Artist solar = artistRepository.findByStageName("Solar Beat").orElseThrow();
        Artist neon = artistRepository.findByStageName("Neon Waves").orElseThrow();
        Artist caribbean = artistRepository.findByStageName("Caribbean Sound").orElseThrow();

        Event event = new Event(
                "CMF-2026", "Caribbean Music Fest 2026", "desc",
                EventCategory.MUSIC, EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 8, 15, 20, 0),
                18, null, venue
        );
        event.addArtist(solar);
        event.addArtist(neon);
        event.addArtist(caribbean);

        eventRepository.saveAndFlush(event);

        Event found = eventRepository.findByEventCode("CMF-2026").orElseThrow();
        assertThat(found.getArtists()).hasSize(3);

        found.addArtist(solar);
        eventRepository.saveAndFlush(found);
        assertThat(found.getArtists()).hasSize(3);
    }

    @Test
    void FR_ART_004_findEventsByArtistStageName() {
        Artist solar = artistRepository.findByStageName("Solar Beat").orElseThrow();

        Event e1 = new Event("EVT-1", "Evento 1", "d", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 1, 1, 20, 0), 0, null, venue);
        Event e2 = new Event("EVT-2", "Evento 2", "d", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 2, 1, 20, 0), 0, null, venue);
        e1.addArtist(solar);
        e2.addArtist(solar);
        eventRepository.saveAndFlush(e1);
        eventRepository.saveAndFlush(e2);

        List<Event> result = artistRepository.findEventsByArtistStageName("Solar Beat");
        assertThat(result).hasSize(2);
    }
}