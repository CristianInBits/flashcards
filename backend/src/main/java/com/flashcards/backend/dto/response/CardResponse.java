package com.flashcards.backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * CardResponse - DTO para devolver información de una tarjeta
 * 
 * Response esperado:
 * {
 *   "id": "uuid...",
 *   "deckId": "uuid...",
 *   "front": "¿Qué es la derivada?",
 *   "back": "La derivada mide...",
 *   "createdAt": "2024-02-10T10:00:00",
 *   "updatedAt": "2024-02-10T10:00:00"
 * }
 */
public record CardResponse(
    UUID id,
    UUID deckId,
    String front,
    String back,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) { }