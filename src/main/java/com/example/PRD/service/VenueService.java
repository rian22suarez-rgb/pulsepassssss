package com.example.PRD.service;

import com.example.PRD.dto.response.VenueResponse;
import java.util.List;

public interface VenueService {
    VenueResponse findByCode(String code);
    List<VenueResponse> findActiveVenues();
}