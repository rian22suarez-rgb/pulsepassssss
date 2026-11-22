package com.example.PRD.security;

import com.example.PRD.controller.ArtistController;
import com.example.PRD.controller.AuthController;
import com.example.PRD.controller.EventController;
import com.example.PRD.controller.TicketController;
import com.example.PRD.controller.UserController;
import com.example.PRD.controller.VenueController;
import com.example.PRD.service.ArtistService;
import com.example.PRD.service.EventService;
import com.example.PRD.service.TicketService;
import com.example.PRD.service.UserService;
import com.example.PRD.service.VenueService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        AuthController.class,
        EventController.class,
        TicketController.class,
        UserController.class,
        ArtistController.class,
        VenueController.class
})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@AutoConfigureMockMvc
class SecurityMatrixTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean EventService eventService;
    @MockitoBean TicketService ticketService;
    @MockitoBean UserService userService;
    @MockitoBean ArtistService artistService;
    @MockitoBean VenueService venueService;

    @MockitoBean JwtService jwtService;
    @MockitoBean CustomUserDetailsService customUserDetailsService;
    @MockitoBean AuthenticationManager authenticationManager;

    @Test
    @DisplayName("T-SEC-001a GET /api/venues/active sin token -> 200")
    void tSec001a_anonymousGetActiveVenues_returns200() throws Exception {
        mvc.perform(get("/api/venues/active")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("T-SEC-001b GET /api/artists/active sin token -> 200")
    void tSec001b_anonymousGetActiveArtists_returns200() throws Exception {
        mvc.perform(get("/api/artists/active")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("T-SEC-001c GET /api/events/published sin token -> 200")
    void tSec001c_anonymousGetPublishedEvents_returns200() throws Exception {
        mvc.perform(get("/api/events/published")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("T-SEC-002a POST /api/events sin token -> 401")
    void tSec002a_anonymousPostEvents_returns401() throws Exception {
        mvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("T-SEC-002b POST /api/tickets sin token -> 401")
    void tSec002b_anonymousPostTickets_returns401() throws Exception {
        mvc.perform(post("/api/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("T-SEC-002c GET /api/users/rian2 sin token -> 401")
    void tSec002c_anonymousGetUser_returns401() throws Exception {
        mvc.perform(get("/api/users/rian2")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("T-SEC-003a POST /api/events con USER -> 403")
    void tSec003a_userPostEvents_returns403() throws Exception {
        mvc.perform(post("/api/events")
                        .with(user("rian2").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("T-SEC-003b PATCH /api/events/X/publish con USER -> 403")
    void tSec003b_userPublishEvent_returns403() throws Exception {
        mvc.perform(patch("/api/events/X/publish")
                        .with(user("rian2").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("T-SEC-003c POST /api/tickets con USER no es 401")
    void tSec003c_userPurchaseTicket_isNotAnonymous() throws Exception {
        mvc.perform(post("/api/tickets")
                        .with(user("rian2").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userEmail\":\"rian2@test.com\",\"eventCode\":\"X\",\"type\":\"GENERAL\"}"))
                .andExpect(status().is(Matchers.not(401)));
    }

    @Test
    @DisplayName("T-SEC-004 POST /api/events con ADMIN no es 401 ni 403")
    void tSec004_adminPostEvents_passesAuthorization() throws Exception {
        mvc.perform(post("/api/events")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().is(Matchers.not(401)))
                .andExpect(status().is(Matchers.not(403)));
    }

    @Test
    @DisplayName("T-SEC-013a PATCH /api/tickets/TCK-0001/use con STAFF no es 401 ni 403")
    void tSec013a_staffMarkAsUsed_passesAuthorization() throws Exception {
        mvc.perform(patch("/api/tickets/TCK-0001/use")
                        .with(user("laura").roles("STAFF")))
                .andExpect(status().is(Matchers.not(401)))
                .andExpect(status().is(Matchers.not(403)));
    }

    @Test
    @DisplayName("T-SEC-013b PATCH /api/tickets/TCK-0001/use con USER -> 403")
    void tSec013b_userMarkAsUsed_returns403() throws Exception {
        mvc.perform(patch("/api/tickets/TCK-0001/use")
                        .with(user("rian2").roles("USER")))
                .andExpect(status().isForbidden());
    }
}