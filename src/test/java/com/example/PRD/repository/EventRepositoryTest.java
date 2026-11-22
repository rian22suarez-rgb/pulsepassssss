package com.example.PRD.repository;

import com.example.PRD.TestcontainersConfiguration;
import com.example.PRD.model.Event;
import com.example.PRD.model.EventStatus;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
class EventRepositoryTest {

    @Autowired
    private EventRepository eventRepository;

    @Test
    void shouldFindByStatusOrderByEventDateAsc() {
        List<Event> events =
                eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED);

        assertThat(events).isNotNull();
    }
}