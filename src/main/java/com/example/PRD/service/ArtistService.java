package com.example.PRD.service;

import com.example.PRD.dto.response.ArtistResponse;
import java.util.List;

public interface ArtistService {
    ArtistResponse findById(Long id);
    ArtistResponse findByName(String stageName);
    List<ArtistResponse> findActiveArtists();
}