package org.uorderflow.service.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.user.UserResponseDTO;
import org.uorderflow.enums.user.UserAction;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserValidation userValidation;

    public UserService(UserRepository userRepository, UserValidation userValidation) {
        this.userRepository = userRepository;
        this.userValidation = userValidation;
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findAll(Pageable pageable){
        return userRepository.findAllPagedByIsDeletedFalse(pageable).map(UserResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO findById(Long id){
        User user = userValidation.validateUser(id, UserAction.ACTIVE_CHECK);
        return new UserResponseDTO(user);
    }

    @Transactional
    public void delete(Long id){
        User user = userValidation.validateUser(id, UserAction.DELETE);
        user.delete();
    }

    @Transactional
    public UserResponseDTO reactivate(Long id){
        User user = userValidation.validateUser(id, UserAction.REACTIVATE);
        user.reactivate();
        return new UserResponseDTO(user);
    }
}
