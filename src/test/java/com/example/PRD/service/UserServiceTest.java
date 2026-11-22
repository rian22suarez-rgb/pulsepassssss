package com.example.PRD.service;

import com.example.PRD.dto.request.RegisterUserRequest;
import com.example.PRD.dto.response.UserResponse;
import com.example.PRD.exception.BusinessRuleException;
import com.example.PRD.exception.DuplicateResourceException;
import com.example.PRD.mapper.UserMapper;
import com.example.PRD.model.User;
import com.example.PRD.model.UserCredential;
import com.example.PRD.model.UserProfile;
import com.example.PRD.repository.UserCredentialRepository;
import com.example.PRD.repository.UserProfileRepository;
import com.example.PRD.repository.UserRepository;
import com.example.PRD.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private UserCredentialRepository userCredentialRepository;   // ← NUEVO
    @Mock private PasswordEncoder passwordEncoder;                     // ← NUEVO
    @Mock private UserMapper userMapper;
    @Mock private AuthorizationService authorizationService;           // ← NUEVO

    @InjectMocks private UserServiceImpl userService;

    private RegisterUserRequest validRequest() {
        return new RegisterUserRequest(
                "andrea",
                "andrea@email.com",
                "UnaFraseSegura12!",
                "Andrea",
                "Gómez",
                "3001234567",
                "Santa Marta",
                LocalDate.of(2000, 1, 1)
        );
    }

    @Test // TEST-USER-001
    void register_validUser_createsUserAndProfile() {
        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@email.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(userCredentialRepository.save(any(UserCredential.class))).thenAnswer(i -> i.getArgument(0));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(i -> i.getArgument(0));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$fakeHashForTest");
        when(userMapper.toResponse(any(User.class))).thenReturn(mock(UserResponse.class));

        userService.register(validRequest());

        verify(userRepository).save(any(User.class));
        verify(userCredentialRepository).save(any(UserCredential.class));
        verify(userProfileRepository).save(any(UserProfile.class));
        verify(passwordEncoder).encode("UnaFraseSegura12!");
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
                "x",
                "x@email.com",
                "UnaFraseSegura12!",
                "Y",
                null,
                null,
                null,
                LocalDate.now().plusDays(1)
        );

        when(userRepository.existsByUsername("x")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("x@email.com")).thenReturn(false);

        assertThatThrownBy(() -> userService.register(req))
                .isInstanceOf(BusinessRuleException.class);
    }
}