package com.flashcards.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DeckRequest - DTO para crear o editar un mazo
 * 
 * Request body esperado:
 * {
 * "title": "Cálculo Diferencial",
 * "description": "Tarjetas para examen de cálculo",
 * "tags": ["matemáticas", "cálculo", "universidad"],
 * "isPublic": false
 * }
 */
public record DeckRequest(

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 255, message = "El título no puede tener más de 255 caracteres")
        String title,

        @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
        String description,

        // Opcional: si no viene, en el service -> []
        String[] tags,

        // Opcional: si no viene, en el service -> false
        Boolean isPublic
) {

    public boolean getIsPublicOrDefault() {
        return isPublic != null && isPublic;
    }
}