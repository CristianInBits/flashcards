package com.flashcards.backend.service;

import com.flashcards.backend.dto.request.CardRequest;
import com.flashcards.backend.dto.response.CardResponse;
import com.flashcards.backend.exception.ResourceNotFoundException;
import com.flashcards.backend.model.Card;
import com.flashcards.backend.model.Deck;
import com.flashcards.backend.model.User;
import com.flashcards.backend.repository.CardRepository;
import com.flashcards.backend.repository.DeckRepository;
import com.flashcards.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardService {

    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;
    private final UserRepository userRepository;

    /**
     * Crear una tarjeta en un mazo
     *
     * Solo el propietario del mazo puede añadir tarjetas
     */
    @Transactional
    public CardResponse createCard(UUID deckId, CardRequest request, String userEmail) {
        log.info("Creando card en deck {} para usuario: {}", deckId, userEmail);

        User user = getUser(userEmail);
        Deck deck = getDeckOwnedBy(deckId, user.getId());

        Card card = Card.builder()
                .deck(deck)
                .front(request.front())
                .back(request.back())
                .build();

        Card saved = cardRepository.save(card);
        log.info("Card creada con ID: {}", saved.getId());

        return mapToResponse(saved);
    }

    /**
     * Listar todas las tarjetas de un mazo
     *
     * Accesible si eres el propietario o el mazo es público
     */
    @Transactional(readOnly = true)
    public List<CardResponse> getCards(UUID deckId, String userEmail) {
        User user = getUser(userEmail);
        getDeckWithReadAccess(deckId, user.getId());

        return cardRepository.findByDeck_Id(deckId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Obtener una tarjeta específica de un mazo
     *
     * Accesible si eres el propietario o el mazo es público
     */
    @Transactional(readOnly = true)
    public CardResponse getCard(UUID deckId, UUID cardId, String userEmail) {
        User user = getUser(userEmail);
        getDeckWithReadAccess(deckId, user.getId());

        Card card = cardRepository.findByIdAndDeckId(cardId, deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada"));

        return mapToResponse(card);
    }

    /**
     * Actualizar una tarjeta
     *
     * Solo el propietario del mazo puede editar tarjetas
     */
    @Transactional
    public CardResponse updateCard(UUID deckId, UUID cardId, CardRequest request, String userEmail) {
        log.info("Actualizando card {} del deck {} para usuario: {}", cardId, deckId, userEmail);

        User user = getUser(userEmail);
        getDeckOwnedBy(deckId, user.getId());

        Card card = cardRepository.findByIdAndDeckId(cardId, deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada"));

        card.setFront(request.front());
        card.setBack(request.back());

        Card saved = cardRepository.save(card);
        log.info("Card {} actualizada", cardId);

        return mapToResponse(saved);
    }

    /**
     * Eliminar una tarjeta
     *
     * Solo el propietario del mazo puede eliminar tarjetas
     */
    @Transactional
    public void deleteCard(UUID deckId, UUID cardId, String userEmail) {
        log.info("Eliminando card {} del deck {} para usuario: {}", cardId, deckId, userEmail);

        User user = getUser(userEmail);
        getDeckOwnedBy(deckId, user.getId());

        Card card = cardRepository.findByIdAndDeckId(cardId, deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada"));

        cardRepository.delete(card);
        log.info("Card {} eliminada", cardId);
    }

    // ========== HELPERS PRIVADOS ==========

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    /** Obtiene el deck solo si el usuario es propietario (para escritura) */
    private Deck getDeckOwnedBy(UUID deckId, UUID userId) {
        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Deck no encontrado"));

        if (!deck.isOwnedBy(userId)) {
            throw new AccessDeniedException("No tienes permiso para modificar este deck");
        }

        return deck;
    }

    /** Obtiene el deck si el usuario es propietario o el deck es público (para lectura) */
    private Deck getDeckWithReadAccess(UUID deckId, UUID userId) {
        return deckRepository.findByIdAndUserIdOrPublic(deckId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Deck no encontrado o no tienes permiso para verlo"));
    }

    private CardResponse mapToResponse(Card card) {
        return new CardResponse(
                card.getId(),
                card.getDeck().getId(),
                card.getFront(),
                card.getBack(),
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }
}
