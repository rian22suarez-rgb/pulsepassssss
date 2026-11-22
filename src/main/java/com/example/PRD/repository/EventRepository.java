package com.example.PRD.repository;

import com.example.PRD.model.Event;
import com.example.PRD.model.EventStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // ★ MAGIA AQUÍ: Obliga a Hibernate a traer la sede y los artistas en la misma consulta
    @EntityGraph(attributePaths = {"venue", "artists"})
    Optional<Event> findByEventCode(String eventCode);

    boolean existsByEventCode(String eventCode);

    @EntityGraph(attributePaths = {"venue"})
    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    List<Event> findByVenueCode(String venueCode);

    @Query("SELECT DISTINCT e FROM Event e JOIN e.artists a WHERE a.stageName = :stageName")
    List<Event> findByArtistStageName(@Param("stageName") String stageName);

    @Query("SELECT DISTINCT e FROM Event e " +
            "JOIN e.venue v JOIN e.artists a " +
            "WHERE v.city = :city AND a.stageName = :stageName")
    List<Event> findByCityAndArtist(@Param("city") String city,
                                    @Param("stageName") String stageName);

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