package com.example.PRD.service.impl;

import com.example.PRD.dto.request.RegisterUserRequest;
import com.example.PRD.dto.response.UserResponse;
import com.example.PRD.exception.BusinessRuleException;
import com.example.PRD.exception.DuplicateResourceException;
import com.example.PRD.exception.ResourceNotFoundException;
import com.example.PRD.mapper.UserMapper;
import com.example.PRD.model.User;
import com.example.PRD.model.UserCredential;
import com.example.PRD.model.UserProfile;
import com.example.PRD.repository.UserCredentialRepository;
import com.example.PRD.repository.UserProfileRepository;
import com.example.PRD.repository.UserRepository;
import com.example.PRD.service.AuthorizationService;
import com.example.PRD.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuthorizationService authorizationService;

    public UserServiceImpl(UserRepository userRepository,
                           UserProfileRepository userProfileRepository,
                           UserCredentialRepository userCredentialRepository,
                           PasswordEncoder passwordEncoder,
                           UserMapper userMapper,
                           AuthorizationService authorizationService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username already exists: " + request.username());
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }
        if (request.birthDate() != null && request.birthDate().isAfter(LocalDate.now())) {
            throw new BusinessRuleException("Birth date cannot be in the future");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setActive(true);
        user.getRoles().add("USER");
        userRepository.save(user);

        UserCredential credential = new UserCredential(user, passwordEncoder.encode(request.password()));
        userCredentialRepository.save(credential);

        UserProfile profile = new UserProfile();
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setPhone(request.phone());
        profile.setCity(request.city());
        profile.setBirthDate(request.birthDate());
        profile.setUser(user);
        userProfileRepository.save(profile);

        user.setProfile(profile);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        // OWNERSHIP (PRD SEC-007 / T-SEC-015):
        // Un USER solo puede consultar sus propios datos; ADMIN puede ver a cualquiera.
        authorizationService.assertCanAccessUserEmail(email);
        return userRepository.findByEmailIgnoreCase(email)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByUsername(String username) {
        // OWNERSHIP (PRD SEC-007 / T-SEC-015):
        // Un USER solo puede consultarse a sí mismo; ADMIN puede ver a cualquiera.
        authorizationService.assertCanAccessUsername(username);
        return userRepository.findByUsername(username)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}