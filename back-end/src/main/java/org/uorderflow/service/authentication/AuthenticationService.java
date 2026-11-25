package org.uorderflow.service.authentication;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.user.UserLoginDTO;
import org.uorderflow.dto.user.UserRegisterDTO;
import org.uorderflow.infra.exception.LoginAlreadyExistsException;
import org.uorderflow.infra.security.TokenService;
import org.uorderflow.model.User;
import org.uorderflow.repository.UserRepository;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationService(AuthenticationManager authenticationManager,
                                 UserRepository userRepository,
                                 TokenService tokenService,
                                 PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    public String login(UserLoginDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = authenticationManager.authenticate(usernamePassword);
        return tokenService.generateToken((User) auth.getPrincipal());
    }

    @Transactional
    public void register(UserRegisterDTO data) {
        if (userRepository.findByEmail(data.email()) != null) {
            throw new LoginAlreadyExistsException("A user with this email already exists: " + data.email());
        }
        String encryptedPassword = passwordEncoder.encode(data.password());
        User user = new User(data, encryptedPassword);
        userRepository.save(user);
    }
}
