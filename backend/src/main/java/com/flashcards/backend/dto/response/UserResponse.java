package com.flashcards.backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(

    UUID id,
    String email,
    String username,
    LocalDateTime createdAt

) { }
