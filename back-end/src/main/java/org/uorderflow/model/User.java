package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.uorderflow.dto.user.UserRegisterDTO;
import org.uorderflow.enums.user.UserRole;

import java.util.Collection;
import java.util.List;

@Table(name = "tb_users")
@Entity(name = "User")
@Getter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class User implements UserDetails {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, length = 100, name = "user_name")
    private String name;

    @Column(nullable = false, unique = true, length = 100, name = "user_email")
    private String email;

    @Column(nullable = false, length = 50, name = "user_password")
    private String password;

    @Column(nullable = false, name = "user_role")
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(nullable = false, name = "is_deleted")
    private Boolean isDeleted;

    public User(UserRegisterDTO data, String password){
        this.name = data.name();
        this.email = data.email();
        this.password = password;
        this.role = data.role();
        this.isDeleted = false;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return switch (this.role) {
            case ADMIN -> List.of(
                    new SimpleGrantedAuthority("ROLE_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_WAITER"),
                    new SimpleGrantedAuthority("ROLE_COOK")
            );
            case WAITER -> List.of(new SimpleGrantedAuthority("ROLE_WAITER"));
            case COOK -> List.of(new SimpleGrantedAuthority("ROLE_COOK"));
        };
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.FALSE.equals(isDeleted);
    }

    public void delete(){
        this.isDeleted = true;
    }

    public void reactivate(){
        this.isDeleted = false;
    }
}
