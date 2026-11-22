package com.example.PRD.service;

import com.example.PRD.dto.request.CreateEventRequest;
import com.example.PRD.dto.response.EventResponse;
import com.example.PRD.exception.BusinessRuleException;
import com.example.PRD.exception.DuplicateResourceException;
import com.example.PRD.exception.ResourceNotFoundException;
import com.example.PRD.mapper.EventMapper;
import com.example.PRD.model.*;
import com.example.PRD.repository.ArtistRepository;
import com.example.PRD.repository.EventRepository;
import com.example.PRD.repository.VenueRepository;
import com.example.PRD.service.impl.EventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock private EventRepository eventRepository;
    @Mock private VenueRepository venueRepository;
    @Mock private ArtistRepository artistRepository;
    @Mock private EventMapper eventMapper;

    @InjectMocks private EventServiceImpl eventService;

    private Venue activeVenue;
    private Event draftEvent;
    private CreateEventRequest validRequest;

    @BeforeEach
    void setUp() {
        activeVenue = new Venue();
        activeVenue.setId(1L);
        activeVenue.setCode("VEN-SMR-01");
        activeVenue.setName("Marina Convention Center");
        activeVenue.setActive(true);

        draftEvent = new Event();
        draftEvent.setEventCode("CMF-2026");
        draftEvent.setName("Caribbean Music Fest 2026");
        draftEvent.setStatus(EventStatus.DRAFT);
        draftEvent.setEventDate(LocalDateTime.now().plusMonths(2));
        draftEvent.setVenue(activeVenue);

        validRequest = new CreateEventRequest(
                "CMF-2026", "Caribbean Music Fest 2026", "desc",
                EventCategory.MUSIC, LocalDateTime.now().plusMonths(2),
                18, "VEN-SMR-01");
    }

    @Test // TEST-EVENT-003
    void create_valid_saves() {
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(activeVenue));
        when(eventRepository.save(any(Event.class))).thenReturn(draftEvent);
        when(eventMapper.toResponse(any(Event.class))).thenReturn(mock(EventResponse.class));

        eventService.create(validRequest);

        verify(eventRepository).save(any(Event.class));
    }

    @Test // TEST-EVENT-004
    void create_venueNotFound_throwsAndNeverSaves() {
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.create(validRequest))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(eventRepository, never()).save(any());
    }

    @Test // TEST-EVENT-005
    void create_inactiveVenue_throws() {
        activeVenue.setActive(false);
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(activeVenue));

        assertThatThrownBy(() -> eventService.create(validRequest))
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never()).save(any());
    }

    @Test // TEST-EVENT-006
    void create_pastDate_throws() {
        CreateEventRequest past = new CreateEventRequest(
                "CMF-2026", "X", "desc",
                EventCategory.MUSIC, LocalDateTime.now().minusDays(1),
                18, "VEN-SMR-01");
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(activeVenue));

        assertThatThrownBy(() -> eventService.create(past))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void create_duplicateCode_throws() {
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(true);

        assertThatThrownBy(() -> eventService.create(validRequest))
                .isInstanceOf(DuplicateResourceException.class);

        verify(eventRepository, never()).save(any());
    }

    @Test // TEST-EVENT-007
    void publish_draft_setsPublished() {
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(draftEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArgument(0));
        when(eventMapper.toResponse(any(Event.class))).thenReturn(mock(EventResponse.class));

        eventService.publish("CMF-2026");

        assertThat(draftEvent.getStatus()).isEqualTo(EventStatus.PUBLISHED);
        verify(eventRepository).save(draftEvent);
    }

    @Test // TEST-EVENT-008
    void publish_cancelled_throwsAndNeverSaves() {
        draftEvent.setStatus(EventStatus.CANCELLED);
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(draftEvent));

        assertThatThrownBy(() -> eventService.publish("CMF-2026"))
                .isInstanceOf(BusinessRuleException.class);

        verify(eventRepository, never()).save(any());
    }

    @Test
    void findByCode_missing_throws() {
        when(eventRepository.findByEventCode("XX")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.findByCode("XX"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}