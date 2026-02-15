package com.flashcards.backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DeckResponse - DTO para devolver información de un mazo
 * 
 * NO incluye el objeto User completo, solo id y username del propietario
 * 
 * Response esperado:
 * {
 *   "id": "uuid...",
 *   "title": "Cálculo Diferencial",
 *   "description": "Tarjetas para examen",
 *   "tags": ["matemáticas", "cálculo"],
 *   "isPublic": false,
 *   "cardCount": 25,
 *   "owner": {
 *     "id": "uuid...",
 *     "username": "estudiante123"
 *   },
 *   "createdAt": "2024-02-10T10:00:00",
 *   "updatedAt": "2024-02-10T10:00:00"
 * }
 */
public record DeckResponse(
    UUID id,
    String title,
    String description,
    String[] tags,
    boolean isPublic,
    Integer cardCount,  // (se calcula en el service)
    OwnerInfo owner,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    /**
     * Información mínima del propietario del mazo
     */
    public record OwnerInfo(
        UUID id,
        String username
    ) { }
}