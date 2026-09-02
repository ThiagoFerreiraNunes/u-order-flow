package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uorderflow.dto.user.UserLoginDTO;
import org.uorderflow.dto.user.UserRegisterDTO;
import org.uorderflow.dto.user.UserTokenDTO;
import org.uorderflow.service.authentication.AuthenticationService;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<UserTokenDTO> login(@RequestBody @Valid UserLoginDTO data){
        String token = authenticationService.login(data);
        return ResponseEntity.ok(new UserTokenDTO(token));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid UserRegisterDTO data){
        authenticationService.register(data);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
