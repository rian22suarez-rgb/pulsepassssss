package com.example.PRD.repository;

import com.example.PRD.model.Ticket;
import com.example.PRD.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketCode(String ticketCode);

    // Sección 14: tickets de un usuario por email (ignorando mayúsculas)
    List<Ticket> findByUserEmailIgnoreCase(String email);

    // Sección 14: tickets de un usuario por email y status
    List<Ticket> findByUserEmailIgnoreCaseAndStatus(String email, TicketStatus status);

    // FR-TKT-007: tickets PAID de un evento por eventCode
    List<Ticket> findByEventEventCodeAndStatus(String eventCode, TicketStatus status);

    // FR-TKT-008: conteo de tickets PAID por eventCode
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.event.eventCode = :eventCode AND t.status = :status")
    long countByEventCodeAndStatus(@Param("eventCode") String eventCode, @Param("status") TicketStatus status);
    long countByEventEventCodeAndStatus(String eventCode, TicketStatus status);

    List<Ticket> findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(String email);
}