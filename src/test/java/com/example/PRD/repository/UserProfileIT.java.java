package com.example.PRD.repository;

import com.example.PRD.TestcontainersConfiguration;
import com.example.PRD.model.User;
import com.example.PRD.model.UserProfile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestcontainersConfiguration.class)
class UserProfileIT {

    @Autowired private UserRepository userRepository;
    @Autowired private UserProfileRepository userProfileRepository;

    @Test
    void QT004_userHasExactlyOneProfile() {
        User user = new User();
        user.setUsername("andrea");
        user.setEmail("andrea@example.com");
        user.setActive(true);
        userRepository.saveAndFlush(user);

        UserProfile profile = new UserProfile();
        profile.setFirstName("Andrea");
        profile.setLastName("Gómez");
        profile.setPhone("3001234567");
        profile.setCity("Santa Marta");
        profile.setBirthDate(LocalDate.of(1995, 5, 20));
        profile.setUser(user);
        userProfileRepository.saveAndFlush(profile);

        User found = userRepository.findByUsername("andrea").orElseThrow();
        assertThat(userProfileRepository.findByUserId(found.getId())).isPresent();
    }

    @Test
    void AC004_secondProfileForSameUserIsRejected() {
        User user = new User();
        user.setUsername("carlos");
        user.setEmail("carlos@example.com");
        user.setActive(true);
        userRepository.saveAndFlush(user);

        UserProfile p1 = new UserProfile();
        p1.setFirstName("Carlos");
        p1.setLastName("Ruiz");
        p1.setUser(user);
        userProfileRepository.saveAndFlush(p1);

        UserProfile p2 = new UserProfile();
        p2.setFirstName("Otro");
        p2.setLastName("Perfil");
        p2.setUser(user);

        assertThatThrownBy(() -> userProfileRepository.saveAndFlush(p2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}