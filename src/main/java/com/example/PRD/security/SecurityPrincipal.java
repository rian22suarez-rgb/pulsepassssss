package com.example.PRD.security;

import com.example.PRD.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Principal de seguridad propio de PulsePass.
 * Expone el id persistente del usuario, username, email y sus roles.
 * Se construye desde la entidad User + UserCredential y se usa como principal
 * en el SecurityContext tras validar el JWT.
 */
public class SecurityPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String passwordHash;
    private final boolean active;
    private final Set<String> roles;

    public SecurityPrincipal(Long id, String username, String email,
                             String passwordHash, boolean active, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.active = active;
        this.roles = roles;
    }

    public static SecurityPrincipal from(User user, String passwordHash) {
        return new SecurityPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                passwordHash,
                Boolean.TRUE.equals(user.getActive()),
                Set.copyOf(user.getRoles())
        );
    }

    // ─── Getters propios ─────────────────────────────────────────────
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public Set<String> getRoles() { return roles; }

    public boolean hasRole(String role) {
        return roles.contains(role);
    }

    public boolean isAdmin() { return hasRole("ADMIN"); }
    public boolean isStaff() { return hasRole("STAFF"); }

    // ─── UserDetails ─────────────────────────────────────────────────
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r))
                .collect(Collectors.toUnmodifiableList());
    }

    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return username; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return active; }
}