package com.flashcards.backend.service;

import com.flashcards.backend.dto.request.DeckRequest;
import com.flashcards.backend.dto.request.UpdateDeckRequest;
import com.flashcards.backend.dto.response.DeckResponse;
import com.flashcards.backend.dto.response.PageResponse;
import com.flashcards.backend.exception.ResourceNotFoundException;
import com.flashcards.backend.model.Deck;
import com.flashcards.backend.model.User;
import com.flashcards.backend.repository.DeckRepository;
import com.flashcards.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeckService {

    private final DeckRepository deckRepository;
    private final UserRepository userRepository;

    /**
     * Crear un nuevo mazo
     * 
     * @param request   - Datos del mazo
     * @param userEmail - Email del usuario autenticado
     * @return DeckResponse con el mazo creado
     */
    @Transactional
    public DeckResponse createDeck(DeckRequest request, String userEmail) {
        log.info("Creando deck para usuario: {}", userEmail);

        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Deck deck = Deck.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .tags(request.tags() != null ? request.tags() : new String[0])
                .isPublic(request.isPublic() != null && request.isPublic())
                .build();

        Deck savedDeck = deckRepository.saveAndFlush(deck);
        log.info("Deck creado con ID: {}", savedDeck.getId());

        return mapToDeckResponse(savedDeck);
    }

    /**
     * Obtener un mazo por ID
     * 
     * Verifica que el usuario tenga permiso (propietario o público)
     * 
     * @param deckId    - ID del mazo
     * @param userEmail - Email del usuario autenticado
     * @return DeckResponse
     */
    @Transactional(readOnly = true)
    public DeckResponse getDeckById(UUID deckId, String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Deck deck = deckRepository.findByIdAndUserIdOrPublic(deckId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Deck no encontrado o no tienes permiso para verlo"));

        return mapToDeckResponse(deck);
    }

    /**
     * Listar mazos con paginación y filtros
     * 
     * @param userEmail  - Email del usuario autenticado
     * @param page       - Número de página (0-indexed)
     * @param size       - Tamaño de página
     * @param search     - Texto de búsqueda (opcional)
     * @param tags       - Tags para filtrar (opcional)
     * @param onlyPublic - Solo mazos públicos (opcional)
     * @return PageResponse con los mazos
     */
    @Transactional(readOnly = true)
    public PageResponse<DeckResponse> getDecks(
            String userEmail,
            int page,
            int size,
            String search,
            String[] tags,
            Boolean onlyPublic) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Crear Pageable con ordenamiento por fecha de creación descendente
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Pageable pageableNoSort = PageRequest.of(page, size);

        Page<Deck> deckPage;

        // Aplicar filtros
        if (tags != null && tags.length > 0) {
            // Búsqueda por tags
            deckPage = deckRepository.findByUserIdOrPublicAndTags(user.getId(), tags, pageableNoSort);
        } else if (search != null && !search.isBlank()) {
            // Búsqueda por título
            deckPage = deckRepository.findByUserIdOrPublicAndTitleContaining(
                    user.getId(),
                    search.trim(),
                    pageable);
        } else if (onlyPublic != null && onlyPublic) {
            // Solo mazos públicos
            deckPage = deckRepository.findByIsPublicTrue(pageable);
        } else {
            // Todos los mazos (propios + públicos)
            deckPage = deckRepository.findByUserIdOrPublic(user.getId(), pageable);
        }

        // Mapear a DeckResponse
        Page<DeckResponse> responsePage = deckPage.map(this::mapToDeckResponse);

        return PageResponse.of(responsePage);
    }

    /**
     * Actualizar un mazo existente (actualización parcial)
     * 
     * Solo el propietario puede actualizar
     * 
     * @param deckId    - ID del mazo
     * @param request   - Datos a actualizar (todos opcionales)
     * @param userEmail - Email del usuario autenticado
     * @return DeckResponse con el mazo actualizado
     */
    @Transactional
    public DeckResponse updateDeck(UUID deckId, UpdateDeckRequest request, String userEmail) {
        log.info("Actualizando deck {} para usuario: {}", deckId, userEmail);

        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Deck no encontrado"));

        // Verificar que sea el propietario
        if (!deck.isOwnedBy(user.getId())) {
            throw new AccessDeniedException("No tienes permiso para editar este deck");
        }

        // Actualización parcial: solo actualizar campos no nulos
        boolean updated = false;

        if (request.title() != null) {
            deck.setTitle(request.title());
            updated = true;
        }

        if (request.description() != null) {
            String desc = request.description().trim();
            deck.setDescription(desc.isBlank() ? null : desc);
            updated = true;
        }

        if (request.tags() != null) {
            // tags = [] → limpiar
            // tags = [...] → reemplazar
            deck.setTags(request.tags());
            updated = true;
        }

        if (request.isPublic() != null) {
            deck.setPublic(request.isPublic());
            updated = true;
        }

        if (updated) {
            Deck savedDeck = deckRepository.saveAndFlush(deck);
            log.info("Deck {} actualizado", deckId);
            return mapToDeckResponse(savedDeck);
        } else {
            log.info("Deck {} no modificado (sin cambios)", deckId);
            return mapToDeckResponse(deck);
        }
    }

    /**
     * Eliminar un mazo
     * 
     * Solo el propietario puede eliminar
     * 
     * @param deckId    - ID del mazo
     * @param userEmail - Email del usuario autenticado
     */
    @Transactional
    public void deleteDeck(UUID deckId, String userEmail) {
        log.info("Eliminando deck {} para usuario: {}", deckId, userEmail);

        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Deck no encontrado"));

        // Verificar que sea el propietario
        if (!deck.isOwnedBy(user.getId())) {
            throw new AccessDeniedException("No tienes permiso para eliminar este deck");
        }

        deckRepository.delete(deck);
        log.info("Deck {} eliminado", deckId);
    }

    // ========== HELPERS PRIVADOS ==========

    /**
     * Mapea Deck entity a DeckResponse DTO
     */
    private DeckResponse mapToDeckResponse(Deck deck) {
        // Por ahora cardCount = 0 (lo implementaremos en la Fase 5)
        Integer cardCount = 0;

        DeckResponse.OwnerInfo owner = new DeckResponse.OwnerInfo(
                deck.getUser().getId(),
                deck.getUser().getUsername());

        return new DeckResponse(
                deck.getId(),
                deck.getTitle(),
                deck.getDescription(),
                deck.getTags() != null ? deck.getTags() : new String[0],
                deck.isPublic(),
                cardCount,
                owner,
                deck.getCreatedAt(),
                deck.getUpdatedAt());
    }
}