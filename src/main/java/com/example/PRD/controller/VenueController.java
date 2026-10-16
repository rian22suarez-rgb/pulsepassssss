package com.example.PRD.controller;

import com.example.PRD.dto.response.VenueResponse;
import com.example.PRD.service.VenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @GetMapping("/{code}")
    public ResponseEntity<VenueResponse> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(venueService.findByCode(code));
    }

    @GetMapping("/active")
    public ResponseEntity<List<VenueResponse>> findActiveVenues() {
        return ResponseEntity.ok(venueService.findActiveVenues());
    }
}