package com.example.PRD.mapper;

import com.example.PRD.dto.response.ArtistResponse;
import com.example.PRD.model.Artist;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ArtistMapper {
    ArtistResponse toResponse(Artist artist);
}