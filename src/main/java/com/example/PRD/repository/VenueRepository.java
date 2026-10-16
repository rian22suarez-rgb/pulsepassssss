package com.example.PRD.repository;

import com.example.PRD.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findByCode(String code);

    // Metodo agregado para listar venues activos ordenados por nombre
    List<Venue> findByActiveTrueOrderByNameAsc();
}