package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.uorderflow.dto.user.UserLoginDTO;
import org.uorderflow.dto.user.UserRegisterDTO;
import org.uorderflow.service.authentication.AuthenticationService;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private static final String AUTH_COOKIE_NAME = "access_token";

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@RequestBody @Valid UserLoginDTO data) {
        String token = authenticationService.login(data);
        ResponseCookie cookie = buildAuthCookie(token, Duration.ofHours(2).toSeconds());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie emptyCookie = buildAuthCookie("", 0);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, emptyCookie.toString())
                .build();
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody @Valid UserRegisterDTO data) {
        authenticationService.register(data);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    private ResponseCookie buildAuthCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(AUTH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }
}
