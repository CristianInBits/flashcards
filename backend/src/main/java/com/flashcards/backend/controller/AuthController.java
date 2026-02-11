package com.flashcards.backend.controller;

import com.flashcards.backend.dto.request.LoginRequest;
import com.flashcards.backend.dto.request.RegisterRequest;
import com.flashcards.backend.dto.response.AuthResponse;
import com.flashcards.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController - Endpoints de autenticación
 * 
 * Rutas:
 * POST /api/auth/register - Registrar nuevo usuario
 * POST /api/auth/login - Login de usuario existente
 * 
 * Estas rutas son PÚBLICAS (no requieren JWT)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - email: {}", request.email());

        AuthResponse response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - email: {}", request.email());

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
}