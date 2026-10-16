package com.example.PRD.security;

import com.example.PRD.model.User;
import com.example.PRD.model.UserCredential;
import com.example.PRD.repository.UserCredentialRepository;
import com.example.PRD.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserCredentialRepository userCredentialRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    UserCredentialRepository userCredentialRepository) {
        this.userRepository = userRepository;
        this.userCredentialRepository = userCredentialRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));

        UserCredential credential = userCredentialRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UsernameNotFoundException("No credentials for user: " + identifier));

        return SecurityPrincipal.from(user, credential.getPasswordHash());
    }
}