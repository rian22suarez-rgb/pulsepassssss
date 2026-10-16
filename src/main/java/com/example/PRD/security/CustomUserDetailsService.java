package com.example.PRD.security;

import com.example.PRD.model.User;
import com.example.PRD.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Buscamos al usuario por username o email usando los métodos existentes del repositorio
        User user = userRepository.findByUsername(identifier)
                .orElseGet(() -> userRepository.findByEmail(identifier)
                        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con el identificador: " + identifier)));

        // Asignamos el rol por defecto del MVP (ROLE_USER)
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));

        // Retornamos el objeto UserDetails para Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password("") // Se validará mediante el AuthenticationManager y AuthService
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!Boolean.TRUE.equals(user.getActive()))
                .build();
    }
}