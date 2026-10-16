package com.example.PRD.repository;

import com.example.PRD.model.Event;
import com.example.PRD.model.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByEventCode(String eventCode);

    // Método agregado para verificar existencia por código de evento
    boolean existsByEventCode(String eventCode);

    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    // FR-VEN-004 / sección 14: eventos de un venue por venue.code
    List<Event> findByVenueCode(String venueCode);

    // FR-ART-004 / sección 14: eventos por artista (JPQL con JOIN)
    @Query("SELECT DISTINCT e FROM Event e JOIN e.artists a WHERE a.stageName = :stageName")
    List<Event> findByArtistStageName(@Param("stageName") String stageName);

    // FR-SRC-002: eventos de una ciudad donde participa un artista
    @Query("SELECT DISTINCT e FROM Event e " +
            "JOIN e.venue v JOIN e.artists a " +
            "WHERE v.city = :city AND a.stageName = :stageName")
    List<Event> findByCityAndArtist(@Param("city") String city,
                                    @Param("stageName") String stageName);

    // FR-SRC-003: eventos recomendados
    @Query("SELECT DISTINCT e FROM Event e " +
            "JOIN e.venue v JOIN e.artists a " +
            "WHERE e.status = com.example.PRD.model.EventStatus.PUBLISHED " +
            "AND e.eventDate > :date " +
            "AND v.city = :city " +
            "AND LOWER(a.stageName) LIKE LOWER(CONCAT('%', :artistText, '%')) " +
            "ORDER BY e.eventDate ASC")
    List<Event> findRecommendedEvents(@Param("date") LocalDateTime date,
                                      @Param("city") String city,
                                      @Param("artistText") String artistText);
}