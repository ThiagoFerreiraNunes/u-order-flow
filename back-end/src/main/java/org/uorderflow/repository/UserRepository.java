package org.uorderflow.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.UserDetails;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    UserDetails findByEmail(String email);

    @Query("SELECT u FROM User u " +
            "WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<User> findAllPagedByName(
            @Param("name") String name,
            Pageable pageable
    );

    @Query("SELECT u FROM User u " +
            "WHERE u.role <> :excludeRole")
    Page<User> findAllPagedExcludingRole(
            @Param("excludeRole") UserRole excludeRole,
            Pageable pageable
    );

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.id <> :id")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("id") Long id);
}
