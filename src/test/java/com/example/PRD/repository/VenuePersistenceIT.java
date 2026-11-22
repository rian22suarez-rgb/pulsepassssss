package com.example.PRD.repository;

import com.example.PRD.TestcontainersConfiguration;
import com.example.PRD.model.Venue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
class VenuePersistenceIT {

    @Autowired
    private VenueRepository venueRepository;

    @Test
    void AC001_persistAndFindVenueByCode() {
        Venue venue = new Venue();
        venue.setCode("VEN-SMR-01");
        venue.setName("Marina Convention Center");
        venue.setCity("Santa Marta");
        venue.setAddress("Calle 1 # 2-3");
        venue.setCapacity(5000);
        venue.setActive(true);

        venueRepository.saveAndFlush(venue);

        Optional<Venue> found = venueRepository.findByCode("VEN-SMR-01");
        assertThat(found).isPresent();
        assertThat(found.get().getCapacity()).isGreaterThan(0);
        assertThat(found.get().getName()).isEqualTo("Marina Convention Center");
    }

    @Test
    void QT009_duplicateCodeIsRejectedByDatabase() {
        Venue v1 = new Venue();
        v1.setCode("VEN-DUP-01");
        v1.setName("Venue A");
        v1.setCity("Bogotá");
        v1.setAddress("Dir A");
        v1.setCapacity(100);
        v1.setActive(true);
        venueRepository.saveAndFlush(v1);

        Venue v2 = new Venue();
        v2.setCode("VEN-DUP-01");
        v2.setName("Venue B");
        v2.setCity("Medellín");
        v2.setAddress("Dir B");
        v2.setCapacity(200);
        v2.setActive(true);

        assertThatThrownBy(() -> venueRepository.saveAndFlush(v2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void FRVEN003_capacityMustBePositive() {
        Venue venue = new Venue();
        venue.setCode("VEN-CAP-01");
        venue.setName("Venue con capacidad 0");
        venue.setCity("Cali");
        venue.setAddress("Dir");
        venue.setCapacity(0);
        venue.setActive(true);

        assertThatThrownBy(() -> venueRepository.saveAndFlush(venue))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}