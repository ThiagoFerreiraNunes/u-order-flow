package org.uorderflow.repository;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.uorderflow.dto.user.UserRegisterDTO;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.User;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired private EntityManager entityManager;
    @Autowired private UserRepository userRepository;

    @Test
    @DisplayName("Should return a page of active users filtered by name")
    void shouldFindAllPagedByNameAndIsDeletedFalse() {
        setupMockUsers();

        Pageable pageable = PageRequest.of(0, 10);
        Page<User> result = userRepository.findAllPagedByName("Thiago", false, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Should return an empty page when searching by a non-existent username")
    void shouldNotFindAllPagedByNameAndIsDeletedFalse() {
        setupMockUsers();

        Pageable pageable = PageRequest.of(0, 10);
        Page<User> result = userRepository.findAllPagedByName("Harry", false, pageable);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return a page of deleted users filtered by name")
    void shouldFindAllPagedByNameAndIsDeletedTrue() {
        setupMockUsers();

        Pageable pageable = PageRequest.of(0, 10);
        Page<User> result = userRepository.findAllPagedByName("Lucas", true, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Lucas");
    }

    @Test
    @DisplayName("Should return a page with all active (non-deleted) users")
    void shouldFindAllPagedByIsDeletedFalse() {
        setupMockUsers();

        Pageable pageable = PageRequest.of(0, 10);
        Page<User> result = userRepository.findAllPaged(false, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(3);
    }

    @Test
    @DisplayName("Should return a page with all deleted users")
    void shouldFindAllPagedByIsDeletedTrue() {
        setupMockUsers();
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> result = userRepository.findAllPaged(true, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Lucas");
    }

    @Test
    @DisplayName("Should return paged users excluding a specific Role")
    void shouldFindAllPagedExcludingRole() {
        setupMockUsers();

        Pageable pageable = PageRequest.of(0, 10);
        Page<User> result = userRepository.findAllPagedExcludingRole(UserRole.COOK ,false, pageable);

        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(2);
    }


    private void setupMockUsers(){
        User user1 = new User(new UserRegisterDTO(
                "Thiago",
                "thiago@gmail.com",
                "12345678910",
                UserRole.ADMIN
        ), "12345678910");

        User user2 = new User(new UserRegisterDTO(
                "Arthur",
                "arthur@gmail.com",
                "12345678910",
                UserRole.CASHIER
        ), "12345678910");

        User user3 = new User(new UserRegisterDTO(
                "Lucas",
                "lucas@gmail.com",
                "12345678910",
                UserRole.WAITER
        ), "12345678910");
        user3.delete();

        User user4 = new User(new UserRegisterDTO(
                "Guilherme",
                "guilherme@gmail.com",
                "12345678910",
                UserRole.COOK
        ), "12345678910");

        entityManager.persist(user1);
        entityManager.persist(user2);
        entityManager.persist(user3);
        entityManager.persist(user4);
    }
}