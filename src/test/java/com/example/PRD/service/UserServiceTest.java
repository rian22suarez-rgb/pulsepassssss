package com.example.PRD.service;

import com.example.PRD.dto.request.RegisterUserRequest;
import com.example.PRD.dto.response.UserResponse;
import com.example.PRD.exception.BusinessRuleException;
import com.example.PRD.exception.DuplicateResourceException;
import com.example.PRD.mapper.UserMapper;
import com.example.PRD.model.User;
import com.example.PRD.model.UserProfile;
import com.example.PRD.repository.UserProfileRepository;
import com.example.PRD.repository.UserRepository;
import com.example.PRD.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private UserMapper userMapper;

    @InjectMocks private UserServiceImpl userService;

    private RegisterUserRequest validRequest() {
        return new RegisterUserRequest(
                "andrea",                     // username
                "andrea@email.com",           // email
                "UnaFraseSegura12!",          // password (mínimo 12 caracteres)
                "Andrea",                     // firstName
                "Gómez",                      // lastName
                "3001234567",                 // phone
                "Santa Marta",                // city
                LocalDate.of(2000, 1, 1)      // birthDate
        );
    }

    @Test // TEST-USER-001
    void register_validUser_createsUserAndProfile() {
        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@email.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(userMapper.toResponse(any(User.class))).thenReturn(mock(UserResponse.class));

        userService.register(validRequest());

        verify(userRepository).save(any(User.class));
        verify(userProfileRepository).save(any(UserProfile.class));
    }

    @Test // TEST-USER-002
    void register_duplicateUsername_throws() {
        when(userRepository.existsByUsername("andrea")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(validRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Username");

        verify(userRepository, never()).save(any());
    }

    @Test // TEST-USER-003
    void register_duplicateEmail_throws() {
        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@email.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(validRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email");

        verify(userRepository, never()).save(any());
    }

    @Test // TEST-USER-004
    void register_futureBirthDate_throws() {
        RegisterUserRequest req = new RegisterUserRequest(
                "x",                                  // username
                "x@email.com",                        // email
                "UnaFraseSegura12!",                  // password (12+ caracteres)
                "Y",                                  // firstName
                null,                                 // lastName
                null,                                 // phone
                null,                                 // city
                LocalDate.now().plusDays(1)           // birthDate (futura)
        );

        when(userRepository.existsByUsername("x")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("x@email.com")).thenReturn(false);

        assertThatThrownBy(() -> userService.register(req))
                .isInstanceOf(BusinessRuleException.class);
    }
}