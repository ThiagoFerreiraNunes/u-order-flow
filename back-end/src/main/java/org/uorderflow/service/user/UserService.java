package org.uorderflow.service.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.user.UserPasswordUpdateDTO;
import org.uorderflow.dto.user.UserResponseDTO;
import org.uorderflow.dto.user.UserUpdateDTO;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

import java.util.Objects;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserValidation userValidation;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserValidation userValidation, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userValidation = userValidation;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findAll(
            String name,
            UserRole excludeRole,
            Pageable pageable,
            boolean isAdmin
    ) {
        if (!isAdmin && excludeRole == null) {
            throw new AccessDeniedException(
                    "Only ADMIN users can list all users."
            );
        }

        if (excludeRole != null) {
            return userRepository
                    .findAllPagedExcludingRole(excludeRole, pageable)
                    .map(UserResponseDTO::new);
        }

        if (name != null && !name.isBlank()) {
            return userRepository
                    .findAllPagedByName(name, pageable)
                    .map(UserResponseDTO::new);
        }

        return userRepository.findAll(pageable)
                .map(UserResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findById(Long id, User loggedUser){
        if(loggedUser.getRole() == UserRole.ADMIN || Objects.equals(loggedUser.getId(), id)){
            User user = userValidation.validateUser(id);
            return new UserResponseDTO(user);
        }
        throw new AccessDeniedException("Users with the " + loggedUser.getRole() + " role can only use the findById method with their own ids.");
    }

    @Transactional
    public UserResponseDTO update(Long id, UserUpdateDTO data) {
        User user = userValidation.validateUser(id);

        if(data.email() != null && !data.email().equals(user.getEmail())){
            boolean emailExists = userRepository.existsByEmailAndIdNot(data.email(), id);
            if (emailExists) {
                throw new BusinessRuleException("A User with the email '" + data.email() + "' already exists");
            }
        }

        user.update(data);
        return new UserResponseDTO(user);
    }

    @Transactional
    public void updatePassword(Long id, UserPasswordUpdateDTO data, User loggedUser) {
        if (loggedUser.getRole() != UserRole.ADMIN && !Objects.equals(loggedUser.getId(), id)) {
            throw new AccessDeniedException("Users with the " + loggedUser.getRole() + " role can only update their own passwords.");
        }

        User user = userValidation.validateUser(id);

        if (loggedUser.getRole() != UserRole.ADMIN) {
            if (!passwordEncoder.matches(data.currentPassword(), user.getPassword())) {
                throw new BadCredentialsException("The current password provided is incorrect.");
            }
        }

        String encryptedPassword = passwordEncoder.encode(data.newPassword());
        user.updatePassword(encryptedPassword);
    }

    @Transactional
    public void delete(Long id){
        User user = userValidation.validateUser(id);
        user.delete();
    }
}
