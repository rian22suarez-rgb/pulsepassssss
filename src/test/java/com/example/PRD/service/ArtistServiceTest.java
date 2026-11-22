package com.example.PRD.service;

import com.example.PRD.dto.response.ArtistResponse;
import com.example.PRD.exception.ResourceNotFoundException;
import com.example.PRD.mapper.ArtistMapper;
import com.example.PRD.model.Artist;
import com.example.PRD.repository.ArtistRepository;
import com.example.PRD.service.impl.ArtistServiceImpl;
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
class ArtistServiceTest {

    @Mock private ArtistRepository artistRepository;
    @Mock private ArtistMapper artistMapper;
    @InjectMocks private ArtistServiceImpl artistService;

    @Test
    void findById_existingArtist_returnsResponse() {
        Artist artist = new Artist();
        artist.setId(1L);
        artist.setStageName("Solar Beat");
        ArtistResponse response = mock(ArtistResponse.class);

        when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(response);

        assertThat(artistService.findById(1L)).isSameAs(response);
    }

    @Test
    void findById_missing_throwsResourceNotFound() {
        when(artistRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> artistService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findByName_usesIgnoreCase() {
        Artist artist = new Artist();
        artist.setStageName("Solar Beat");
        ArtistResponse response = mock(ArtistResponse.class);

        when(artistRepository.findByStageNameIgnoreCase("solar beat")).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(response);

        assertThat(artistService.findByName("solar beat")).isSameAs(response);
    }

    @Test
    void findActiveArtists_returnsMappedList() {
        Artist a1 = new Artist(); a1.setStageName("A1");
        Artist a2 = new Artist(); a2.setStageName("A2");
        ArtistResponse r1 = mock(ArtistResponse.class);
        ArtistResponse r2 = mock(ArtistResponse.class);

        when(artistRepository.findByActiveTrueOrderByStageNameAsc()).thenReturn(List.of(a1, a2));
        when(artistMapper.toResponse(a1)).thenReturn(r1);
        when(artistMapper.toResponse(a2)).thenReturn(r2);

        assertThat(artistService.findActiveArtists()).containsExactly(r1, r2);
    }
}