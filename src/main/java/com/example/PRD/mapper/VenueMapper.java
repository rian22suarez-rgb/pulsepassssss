package com.example.PRD.mapper;

import com.example.PRD.dto.response.VenueResponse;
import com.example.PRD.model.Venue;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VenueMapper {
    VenueResponse toResponse(Venue venue);
}