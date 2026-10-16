package com.example.PRD.service.impl;

import com.example.PRD.security.SecurityPrincipal;
import com.example.PRD.service.AuthorizationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {

    @Override
    public SecurityPrincipal currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SecurityPrincipal principal)) {
            throw new IllegalStateException("No authenticated principal in context");
        }
        return principal;
    }

    @Override
    public boolean isAdmin() {
        return currentPrincipal().isAdmin();
    }

    @Override
    public boolean isStaffOrAdmin() {
        SecurityPrincipal p = currentPrincipal();
        return p.isAdmin() || p.isStaff();
    }

    @Override
    public void assertCanAccessUserEmail(String email) {
        SecurityPrincipal p = currentPrincipal();
        if (p.isAdmin()) return;
        if (email == null || !email.equalsIgnoreCase(p.getEmail())) {
            throw new AccessDeniedException(
                    "No tiene permisos para acceder a los recursos de otro usuario");
        }
    }

    @Override
    public void assertCanAccessUsername(String username) {
        SecurityPrincipal p = currentPrincipal();
        if (p.isAdmin()) return;
        if (username == null || !username.equalsIgnoreCase(p.getUsername())) {
            throw new AccessDeniedException(
                    "No tiene permisos para acceder a los recursos de otro usuario");
        }
    }

    @Override
    public void assertCanAccessUserId(Long userId) {
        SecurityPrincipal p = currentPrincipal();
        if (p.isAdmin()) return;
        if (userId == null || !userId.equals(p.getId())) {
            throw new AccessDeniedException(
                    "No tiene permisos para acceder a los recursos de otro usuario");
        }
    }
}