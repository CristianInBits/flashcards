package com.flashcards.backend.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateDeckRequest(

        @Size(max = 255, message = "El título no puede tener más de 255 caracteres")
        String title,

        @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
        String description,

        /**
         * tags:
         * - null  => no tocar
         * - []    => borrar todos
         * - [..]  => reemplazar
         */
        String[] tags,

        /**
         * isPublic:
         * - null => no tocar
         * - true/false => actualizar
         */
        Boolean isPublic
) { }
