package com.flashcards.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * CardRequest - DTO para crear o editar una tarjeta
 * 
 * Request body esperado:
 * {
 *   "front": "¿Qué es la derivada?",
 *   "back": "La derivada mide la tasa de cambio instantánea: $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$"
 * }
 */
public record CardRequest(
    @NotBlank(message = "El frente de la tarjeta es obligatorio")
    String front,

    @NotBlank(message = "El reverso de la tarjeta es obligatorio")
    String back
) { }