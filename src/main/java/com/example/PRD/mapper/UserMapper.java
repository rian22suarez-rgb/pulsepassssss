package com.example.PRD.mapper;

import com.example.PRD.dto.response.UserResponse;
import com.example.PRD.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "firstName", source = "profile.firstName")
    @Mapping(target = "lastName",  source = "profile.lastName")
    @Mapping(target = "phone",     source = "profile.phone")
    @Mapping(target = "city",      source = "profile.city")
    @Mapping(target = "birthDate", source = "profile.birthDate")
    UserResponse toResponse(User user);
}