package org.uorderflow.service.user;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

@Component
public class UserValidation {

    private final UserRepository userRepository;

    public UserValidation(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User validateUser(Long id){
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id " + id + "."));

        return user;
    }
}
