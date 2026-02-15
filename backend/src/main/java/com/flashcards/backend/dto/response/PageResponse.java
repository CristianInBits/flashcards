package com.flashcards.backend.dto.response;

import java.util.List;

/**
 * PageResponse - DTO genérico para respuestas paginadas
 * 
 * @param <T> Tipo de contenido (DeckResponse, CardResponse, etc.)
 * 
 * Response esperado:
 * {
 *   "content": [...],       // Lista de items
 *   "page": 0,              // Página actual (0-indexed)
 *   "size": 20,             // Tamaño de página
 *   "totalElements": 100,   // Total de elementos
 *   "totalPages": 5         // Total de páginas
 * }
 */
public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    /**
     * Constructor de conveniencia desde org.springframework.data.domain.Page
     */
    public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }
}