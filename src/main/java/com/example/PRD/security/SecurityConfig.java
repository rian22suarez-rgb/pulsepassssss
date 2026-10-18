package com.example.PRD.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1) Sin CSRF (API stateless con JWT)
                .csrf(csrf -> csrf.disable())

                // 2) Sin sesión en servidor (cada request lleva su token)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // ─────────────────────────────────────────────
                        // 1) PÚBLICAS: login, register y fallback de error
                        // ─────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/actuator/health").permitAll()

                        // ─────────────────────────────────────────────
                        // 2) PÚBLICAS de solo lectura (catálogo)
                        //    Rutas específicas ANTES de patrones generales
                        // ─────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/events/published").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events/by-artist").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/artists/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/venues/**").permitAll()

                        // ─────────────────────────────────────────────
                        // 3) SOLO ADMIN: gestión de eventos (usando hasAuthority)
                        // ─────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/events").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/events/*/publish").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/events/*/artists/*").hasAuthority("ADMIN")

                        // ─────────────────────────────────────────────
                        // 4) STAFF / ADMIN: operación de tickets
                        // ─────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/events/*/tickets/paid").hasAnyAuthority("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/use").hasAnyAuthority("STAFF", "ADMIN")

                        // ─────────────────────────────────────────────
                        // 5) AUTENTICADOS: tickets y perfil
                        // ─────────────────────────────────────────────
                        .requestMatchers("/api/tickets/**").authenticated()
                        .requestMatchers("/api/users/**").authenticated()

                        // ─────────────────────────────────────────────
                        // 6) Todo lo demás: autenticado (deny por defecto)
                        // ─────────────────────────────────────────────
                        .anyRequest().authenticated()
                )

                // 4) Si NO hay token válido → 401 en vez de 403
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )

                // 5) Proveedor de autenticación (userDetailsService + BCrypt)
                .authenticationProvider(authenticationProvider())

                // 6) Filtro JWT antes del filtro estándar
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}