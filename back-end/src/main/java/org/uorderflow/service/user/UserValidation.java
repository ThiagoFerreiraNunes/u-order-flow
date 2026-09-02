package org.uorderflow.service.user;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.enums.generic.ValidateAction;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

@Component
public class UserValidation {

    @Autowired UserRepository userRepository;

    public User validateUser(Long id, ValidateAction action){
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
        }

        return user;
    }
}
