package com.example.PRD;

import com.example.PRD.repository.ArtistRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
class FlywayMigrationIT {

    @Autowired
    private ArtistRepository artistRepository;

    @Test
    void flywayAppliedV2_andInitialArtistsArePresent() {
        long count = artistRepository.count();
        assertThat(count).isEqualTo(5);
    }

    @Test
    void flywayAppliedV3_andSolarBeatIsPresent() {
        assertThat(artistRepository.findByStageName("Solar Beat")).isPresent();
    }
}