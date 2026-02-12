package com.flashcards.backend.controller;

import com.flashcards.backend.dto.response.UserResponse;
import com.flashcards.backend.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        log.debug("Solicitud de perfil (/me) recibida");

        UserResponse userResponse = userService.getUserResponseByEmail(email);
        
        return ResponseEntity.ok(userResponse);
    }
}