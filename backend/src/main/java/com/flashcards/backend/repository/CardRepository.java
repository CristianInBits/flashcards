package com.flashcards.backend.repository;

import com.flashcards.backend.model.Card;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * CardRepository - Acceso a la tabla cards
 */
@Repository
public interface CardRepository extends JpaRepository<Card, UUID> {

    /**
     * Buscar todas las tarjetas de un deck (paginado)
     */
    Page<Card> findByDeck_Id(UUID deckId, Pageable pageable);

    /**
     * Buscar todas las tarjetas de un deck (sin paginación)
     * Útil para modo de estudio
     */
    List<Card> findByDeck_Id(UUID deckId);

    /**
     * Contar tarjetas de un deck
     */
    long countByDeck_Id(UUID deckId);

    /**
     * Buscar una tarjeta específica de un deck
     * (verifica que la tarjeta pertenezca al deck)
     */
    @Query("""
        SELECT c FROM Card c
        WHERE c.id = :cardId AND c.deck.id = :deckId
        """)
    Optional<Card> findByIdAndDeckId(
        @Param("cardId") UUID cardId,
        @Param("deckId") UUID deckId
    );

    /**
     * Verificar si una tarjeta pertenece a un deck
     */
    boolean existsByIdAndDeck_Id(UUID cardId, UUID deckId);
}