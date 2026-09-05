package org.uorderflow.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.UserDetails;
import org.uorderflow.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    UserDetails findByEmail(String email);

    @Query("SELECT u FROM User u " +
            "WHERE u.isDeleted = false AND " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<User> searchAllPagedByName(@Param("name") String name, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false")
    Page<User> findAllPagedByIsDeletedFalse(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.isDeleted = true")
    Page<User> findAllPagedByIsDeletedTrue(Pageable pageable);
}
