package com.flashcards.backend.controller;

import com.flashcards.backend.dto.request.CardRequest;
import com.flashcards.backend.dto.response.CardResponse;
import com.flashcards.backend.service.CardService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * CardController - Endpoints para gestionar tarjetas de un mazo
 *
 * Todos los endpoints requieren autenticación (JWT)
 *
 * Base URL: /api/decks/{deckId}/cards
 */
@RestController
@RequestMapping("/api/decks/{deckId}/cards")
@RequiredArgsConstructor
@Slf4j
public class CardController {

    private final CardService cardService;

    /**
     * POST /api/decks/{deckId}/cards
     *
     * Crear una tarjeta en el mazo. Solo el propietario puede añadir tarjetas.
     *
     * Request body:
     * {
     *   "front": "¿Qué es la derivada?",
     *   "back": "La tasa de cambio instantánea: $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}$"
     * }
     *
     * Response 201 Created: CardResponse
     */
    @PostMapping
    public ResponseEntity<CardResponse> createCard(
            @PathVariable UUID deckId,
            @Valid @RequestBody CardRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("POST /api/decks/{}/cards - Usuario: {}", deckId, userEmail);

        CardResponse response = cardService.createCard(deckId, request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/decks/{deckId}/cards
     *
     * Listar todas las tarjetas del mazo.
     * Accesible si eres propietario o el mazo es público.
     *
     * Response 200 OK: List<CardResponse>
     */
    @GetMapping
    public ResponseEntity<List<CardResponse>> getCards(
            @PathVariable UUID deckId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("GET /api/decks/{}/cards - Usuario: {}", deckId, userEmail);

        List<CardResponse> response = cardService.getCards(deckId, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/decks/{deckId}/cards/{cardId}
     *
     * Obtener una tarjeta específica.
     * Accesible si eres propietario o el mazo es público.
     *
     * Response 200 OK: CardResponse
     * Response 404: Tarjeta no encontrada
     */
    @GetMapping("/{cardId}")
    public ResponseEntity<CardResponse> getCard(
            @PathVariable UUID deckId,
            @PathVariable UUID cardId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("GET /api/decks/{}/cards/{} - Usuario: {}", deckId, cardId, userEmail);

        CardResponse response = cardService.getCard(deckId, cardId, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/decks/{deckId}/cards/{cardId}
     *
     * Actualizar una tarjeta (reemplaza front y back).
     * Solo el propietario del mazo puede editar.
     *
     * Response 200 OK: CardResponse actualizada
     * Response 403: No eres el propietario
     * Response 404: Tarjeta no encontrada
     */
    @PutMapping("/{cardId}")
    public ResponseEntity<CardResponse> updateCard(
            @PathVariable UUID deckId,
            @PathVariable UUID cardId,
            @Valid @RequestBody CardRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("PUT /api/decks/{}/cards/{} - Usuario: {}", deckId, cardId, userEmail);

        CardResponse response = cardService.updateCard(deckId, cardId, request, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/decks/{deckId}/cards/{cardId}
     *
     * Eliminar una tarjeta. Solo el propietario puede eliminar.
     *
     * Response 204 No Content: Eliminada exitosamente
     * Response 403: No eres el propietario
     * Response 404: Tarjeta no encontrada
     */
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(
            @PathVariable UUID deckId,
            @PathVariable UUID cardId,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("DELETE /api/decks/{}/cards/{} - Usuario: {}", deckId, cardId, userEmail);

        cardService.deleteCard(deckId, cardId, userEmail);
        return ResponseEntity.noContent().build();
    }
}
