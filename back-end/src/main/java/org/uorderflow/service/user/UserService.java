package org.uorderflow.service.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.user.UserResponseDTO;
import org.uorderflow.enums.user.UserAction;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

import java.util.Objects;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserValidation userValidation;

    public UserService(UserRepository userRepository, UserValidation userValidation) {
        this.userRepository = userRepository;
        this.userValidation = userValidation;
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findAll(String name, boolean isDeleted, UserRole excludeRole, Pageable pageable, boolean isAdmin){
        if (isDeleted && !isAdmin) {
            throw new AccessDeniedException("Only users with the ADMIN role can view deleted users.");
        }

        if (excludeRole != null) {
            return userRepository.findAllPagedExcludingRole(excludeRole, isDeleted, pageable).map(UserResponseDTO::new);
        }

        if (isAdmin) {
            if (name != null && !name.isBlank()) {
                return userRepository.findAllPagedByName(name, isDeleted, pageable).map(UserResponseDTO::new);
            }

            return userRepository.findAllPaged(isDeleted, pageable).map(UserResponseDTO::new);
        }

        throw new AccessDeniedException("Only users with the ADMIN role can use the findAll method without the 'exclude-role' parameter.");
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findById(Long id, User loggedUser){
        if(loggedUser.getRole() == UserRole.ADMIN || Objects.equals(loggedUser.getId(), id)){
            User user = userValidation.validateUser(id, UserAction.ACTIVE_CHECK);
            return new UserResponseDTO(user);
        }
        throw new AccessDeniedException("Users with the " + loggedUser.getRole() + " role can only use the findById method with their own ids.");
    }

    @Transactional
    public void delete(Long id){
        User user = userValidation.validateUser(id, UserAction.ACTIVE_CHECK);
        user.delete();
    }

    @Transactional
    public UserResponseDTO reactivate(Long id){
        User user = userValidation.validateUser(id, UserAction.ACTIVE_CHECK);
        user.reactivate();
        return new UserResponseDTO(user);
    }
}
