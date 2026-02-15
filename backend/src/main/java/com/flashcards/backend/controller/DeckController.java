package com.flashcards.backend.controller;

import com.flashcards.backend.dto.request.DeckRequest;
import com.flashcards.backend.dto.request.UpdateDeckRequest;
import com.flashcards.backend.dto.response.DeckResponse;
import com.flashcards.backend.dto.response.PageResponse;
import com.flashcards.backend.service.DeckService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Arrays;
import java.util.UUID;

/**
 * DeckController - Endpoints para gestionar mazos
 * 
 * Todos los endpoints requieren autenticación (JWT)
 * 
 * Base URL: /api/decks
 */
@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
@Slf4j
public class DeckController {

    private final DeckService deckService;

    /**
     * POST /api/decks
     * 
     * Crear un nuevo mazo
     * 
     * Request body:
     * {
     *   "title": "Cálculo Diferencial",
     *   "description": "Tarjetas para examen",
     *   "tags": ["matemáticas", "cálculo"],
     *   "isPublic": false
     * }
     * 
     * Response 201 Created:
     * {
     *   "id": "uuid...",
     *   "title": "Cálculo Diferencial",
     *   "description": "Tarjetas para examen",
     *   "tags": ["matemáticas", "cálculo"],
     *   "isPublic": false,
     *   "cardCount": 0,
     *   "owner": {
     *     "id": "uuid...",
     *     "username": "usuario123"
     *   },
     *   "createdAt": "2024-02-10T10:00:00",
     *   "updatedAt": "2024-02-10T10:00:00"
     * }
     * 
     * @param request - Datos del mazo
     * @param authentication - Usuario autenticado (inyectado por Spring)
     * @return DeckResponse
     */
    @PostMapping
    public ResponseEntity<DeckResponse> createDeck(
            @Valid @RequestBody DeckRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("POST /api/decks - Usuario: {}", userEmail);

        DeckResponse response = deckService.createDeck(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/decks/{id}
     * 
     * Obtener un mazo específico
     * 
     * Solo si:
     * - Eres el propietario, O
     * - El mazo es público
     * 
     * Response 200 OK: DeckResponse
     * Response 404: Deck no encontrado o sin permiso
     * 
     * @param id - ID del mazo
     * @param authentication - Usuario autenticado
     * @return DeckResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<DeckResponse> getDeckById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("GET /api/decks/{} - Usuario: {}", id, userEmail);

        DeckResponse response = deckService.getDeckById(id, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/decks
     * 
     * Listar mazos con paginación y filtros
     * 
     * Query params (todos opcionales):
     * - page: Número de página (default: 0)
     * - size: Tamaño de página (default: 20, max: 100)
     * - search: Búsqueda por título (case-insensitive)
     * - tags: Tags separados por coma (ej: "matemáticas,física")
     * - onlyPublic: true/false (solo mazos públicos)
     * 
     * Ejemplos:
     * GET /api/decks?page=0&size=10
     * GET /api/decks?search=cálculo
     * GET /api/decks?tags=matemáticas,física
     * GET /api/decks?onlyPublic=true
     * 
     * Response 200 OK:
     * {
     *   "content": [...],
     *   "page": 0,
     *   "size": 20,
     *   "totalElements": 100,
     *   "totalPages": 5
     * }
     * 
     * @param page - Número de página (0-indexed)
     * @param size - Tamaño de página
     * @param search - Texto de búsqueda (opcional)
     * @param tags - Tags para filtrar (opcional)
     * @param onlyPublic - Solo públicos (opcional)
     * @param authentication - Usuario autenticado
     * @return PageResponse<DeckResponse>
     */
    @GetMapping
    public ResponseEntity<PageResponse<DeckResponse>> getDecks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) Boolean onlyPublic,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("GET /api/decks - Usuario: {}, page: {}, size: {}", userEmail, page, size);

        page = Math.max(page, 0);
        size = Math.min(Math.max(size, 1), 100);

        String[] tagsArray = null;
        if (tags != null && !tags.isBlank()) {
            tagsArray = Arrays.stream(tags.split(","))
                    .map(String::trim)
                    .filter(t -> !t.isBlank())
                    .toArray(String[]::new);

            if (tagsArray.length == 0) {
                tagsArray = null;
            }
        }

        PageResponse<DeckResponse> response = deckService.getDecks(
                userEmail,
                page,
                size,
                search,
                tagsArray,
                onlyPublic
        );

        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/decks/{id}
     * 
     * Actualizar un mazo (actualización parcial)
     * 
     * Solo el propietario puede actualizar
     * 
     * Todos los campos son opcionales:
     * - Campos presentes: Se actualizan
     * - Campos omitidos: No se modifican
     * 
     * Request body (actualizar solo título):
     * {
     *   "title": "Nuevo título"
     * }
     * 
     * Request body (limpiar tags):
     * {
     *   "tags": []
     * }
     * 
     * Response 200 OK: DeckResponse actualizado
     * Response 403: No eres el propietario
     * Response 404: Deck no encontrado
     * 
     * @param id - ID del mazo
     * @param request - Campos a actualizar
     * @param authentication - Usuario autenticado
     * @return DeckResponse actualizado
     */
    @PatchMapping("/{id}")
    public ResponseEntity<DeckResponse> updateDeck(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDeckRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("PUT /api/decks/{} - Usuario: {}", id, userEmail);

        DeckResponse response = deckService.updateDeck(id, request, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/decks/{id}
     * 
     * Eliminar un mazo
     * 
     * Solo el propietario puede eliminar
     * Esto también eliminará todas las tarjetas del mazo (CASCADE)
     * 
     * Response 204 No Content: Eliminado exitosamente
     * Response 403: No eres el propietario
     * Response 404: Deck no encontrado
     * 
     * @param id - ID del mazo
     * @param authentication - Usuario autenticado
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeck(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        log.debug("DELETE /api/decks/{} - Usuario: {}", id, userEmail);

        deckService.deleteDeck(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}