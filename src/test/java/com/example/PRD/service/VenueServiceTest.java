package com.example.PRD.service;

import com.example.PRD.dto.response.VenueResponse;
import com.example.PRD.exception.ResourceNotFoundException;
import com.example.PRD.mapper.VenueMapper;
import com.example.PRD.model.Venue;
import com.example.PRD.repository.VenueRepository;
import com.example.PRD.service.impl.VenueServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock private VenueRepository venueRepository;
    @Mock private VenueMapper venueMapper;
    @InjectMocks private VenueServiceImpl venueService;

    @Test
    void findByCode_existingVenue_returnsResponse() {
        Venue venue = new Venue();
        venue.setCode("VEN-SMR-01");
        VenueResponse response = mock(VenueResponse.class);

        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(response);

        VenueResponse result = venueService.findByCode("VEN-SMR-01");

        assertThat(result).isSameAs(response);
        verify(venueRepository).findByCode("VEN-SMR-01");
    }

    @Test
    void findByCode_missingVenue_throwsResourceNotFound() {
        when(venueRepository.findByCode("VEN-XXX")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> venueService.findByCode("VEN-XXX"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("VEN-XXX");
    }

    @Test
    void findActiveVenues_returnsMappedList() {
        Venue v1 = new Venue(); v1.setCode("V1");
        Venue v2 = new Venue(); v2.setCode("V2");
        VenueResponse r1 = mock(VenueResponse.class);
        VenueResponse r2 = mock(VenueResponse.class);

        when(venueRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(v1, v2));
        when(venueMapper.toResponse(v1)).thenReturn(r1);
        when(venueMapper.toResponse(v2)).thenReturn(r2);

        List<VenueResponse> result = venueService.findActiveVenues();

        assertThat(result).containsExactly(r1, r2);
    }
}