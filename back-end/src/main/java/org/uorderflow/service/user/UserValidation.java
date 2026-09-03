package org.uorderflow.service.user;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.enums.user.UserAction;
import org.uorderflow.enums.user.UserRole;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

@Component
public class UserValidation {

    private final UserRepository userRepository;

    public UserValidation(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User validateUser(Long id, UserAction action){
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.TRUE.equals(user.getIsDeleted())){
                    throw new BusinessRuleException("User is deleted with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.TRUE.equals(user.getIsDeleted())){
                    throw new BusinessRuleException("User is already deleted with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.FALSE.equals(user.getIsDeleted())){
                    throw new BusinessRuleException("User is already activated with id " + id + ".");
                }
            }
            case CREATE_ORDER -> {
                if(Boolean.TRUE.equals(user.getIsDeleted())){
                    throw new BusinessRuleException("User is deleted with id " + id + ".");
                }
                if(user.getRole() == UserRole.COOK){
                    throw new BusinessRuleException("A user with the COOK role cannot be associated with an order.");
                }
            }
        }

        return user;
    }
}
