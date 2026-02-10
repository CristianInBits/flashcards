package com.flashcards.backend.dto.response;

public record AuthResponse(
    String token,
    UserResponse user
) { }