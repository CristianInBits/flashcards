package com.flashcards.backend.service;

import com.flashcards.backend.dto.request.LoginRequest;
import com.flashcards.backend.dto.request.RegisterRequest;
import com.flashcards.backend.dto.response.AuthResponse;
import com.flashcards.backend.dto.response.UserResponse;
import com.flashcards.backend.exception.DuplicateResourceException;

import com.flashcards.backend.model.User;
import com.flashcards.backend.repository.UserRepository;
import com.flashcards.backend.security.JwtTokenProvider;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.AuthenticationException;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String normalizedEmail = normalizeEmail(request.email());
        String normalizedUsername = normalizeUsername(request.username());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("Intento de registro con email duplicado: {}", normalizedEmail);
            throw new DuplicateResourceException("El email ya está registrado");
        }
        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            log.warn("Intento de registro con username duplicado: {}", normalizedUsername);
            throw new DuplicateResourceException("El username ya está en uso");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .username(normalizedUsername)
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        try {
            User savedUser = userRepository.save(user);
            log.info("Usuario registrado con éxito. ID: {}", savedUser.getId());

            String token = jwtTokenProvider.generateToken(savedUser.getEmail());
            return new AuthResponse(token, mapToUserResponse(savedUser));

        } catch (DataIntegrityViolationException e) {
            log.error("Error de integridad de datos al registrar usuario: {}", e.getMessage());
            throw new DuplicateResourceException("El email o username ya están en uso");
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String normalizedEmail = normalizeEmail(request.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            request.password()));

        } catch (AuthenticationException ex) {
            log.warn("Fallo de autenticación (password incorrecta) para: {}", normalizedEmail);
            throw new BadCredentialsException("Email o contraseña incorrectos");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));

        String token = jwtTokenProvider.generateToken(user.getEmail());

        log.info("Login exitoso para usuario ID: {}", user.getId());
        return new AuthResponse(token, mapToUserResponse(user));
    }

    // --- Helpers Privados ---

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeUsername(String username) {
        return username == null ? null : username.trim();
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getCreatedAt());
    }
}