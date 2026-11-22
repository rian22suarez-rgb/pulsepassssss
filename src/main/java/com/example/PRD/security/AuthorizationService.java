package com.example.PRD.service;

import com.example.PRD.security.SecurityPrincipal;

/**
 * Reglas centralizadas de autorización a nivel de recurso (ownership).
 * Lanza AccessDeniedException si el usuario autenticado no puede acceder al recurso.
 * Tal como exige el PRD (sección 7.1, 8, 11.1), la comprobación de propiedad
 * NO debe quedar solo en el Controller.
 */
public interface AuthorizationService {

    /** Devuelve el principal actual o lanza IllegalStateException si no hay sesión. */
    SecurityPrincipal currentPrincipal();

    /** True si el usuario actual es ADMIN. */
    boolean isAdmin();

    /** True si el usuario actual es STAFF o ADMIN. */
    boolean isStaffOrAdmin();

    /**
     * Verifica que el usuario actual sea el dueño del email dado (por coincidencia de email),
     * o bien ADMIN. Lanza AccessDeniedException en caso contrario.
     */
    void assertCanAccessUserEmail(String email);

    /**
     * Verifica que el usuario actual sea el dueño del username dado,
     * o bien ADMIN. Lanza AccessDeniedException en caso contrario.
     */
    void assertCanAccessUsername(String username);

    /**
     * Verifica que el usuario actual sea el dueño del userId dado,
     * o bien ADMIN. Lanza AccessDeniedException en caso contrario.
     */
    void assertCanAccessUserId(Long userId);
}