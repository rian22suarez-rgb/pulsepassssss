package com.example.PRD.service.impl;

import com.example.PRD.dto.request.CreateEventRequest;
import com.example.PRD.dto.response.EventResponse;
import com.example.PRD.dto.response.EventSummaryResponse;
import com.example.PRD.exception.BusinessRuleException;
import com.example.PRD.exception.DuplicateResourceException;
import com.example.PRD.exception.ResourceNotFoundException;
import com.example.PRD.mapper.EventMapper;
import com.example.PRD.model.*;
import com.example.PRD.repository.ArtistRepository;
import com.example.PRD.repository.EventRepository;
import com.example.PRD.repository.VenueRepository;
import com.example.PRD.service.EventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;

    public EventServiceImpl(EventRepository eventRepository,
                            VenueRepository venueRepository,
                            ArtistRepository artistRepository,
                            EventMapper eventMapper) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
    }

    @Override
    @Transactional
    public EventResponse create(CreateEventRequest request) {
        if (eventRepository.existsByEventCode(request.eventCode())) {
            throw new DuplicateResourceException("Event code already exists: " + request.eventCode());
        }
        Venue venue = venueRepository.findByCode(request.venueCode())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found: " + request.venueCode()));
        if (!venue.getActive()) {
            throw new BusinessRuleException("Venue is not active: " + request.venueCode());
        }
        if (request.eventDate() == null || !request.eventDate().isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException("Event date must be in the future");
        }
        if (request.minimumAge() != null && request.minimumAge() < 0) {
            throw new BusinessRuleException("Minimum age must be >= 0");
        }

        Event event = new Event(
                request.eventCode(),
                request.name(),
                request.description(),
                request.category(),
                EventStatus.DRAFT,
                request.eventDate(),
                request.minimumAge(),
                null,
                venue
        );
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse findByCode(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .map(eventMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findPublishedEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public EventResponse publish(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));
        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException("Only DRAFT events can be published. Current: " + event.getStatus());
        }
        if (event.getEventDate() == null || !event.getEventDate().isAfter(LocalDateTime.now())) {
            throw new BusinessRuleException("Event date must be in the future");
        }
        if (!event.getVenue().getActive()) {
            throw new BusinessRuleException("Venue is not active");
        }
        event.setStatus(EventStatus.PUBLISHED);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional
    public EventResponse addArtist(String eventCode, Long artistId) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found: " + artistId));

        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.FINISHED) {
            throw new BusinessRuleException("Cannot add artists to event in status: " + event.getStatus());
        }
        if (event.getArtists().contains(artist)) {
            throw new BusinessRuleException("Artist already associated: " + artist.getStageName());
        }
        event.addArtist(artist);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findByArtist(String stageName) {
        return eventRepository.findByArtistStageName(stageName)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }
}