package com.flashcards.backend.repository;

import com.flashcards.backend.model.Deck;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * DeckRepository - Acceso a la tabla decks
 * 
 * Incluye queries personalizadas para:
 * - Buscar mazos del usuario
 * - Buscar mazos públicos
 * - Buscar por título
 * - Buscar por tags
 */
@Repository
public interface DeckRepository extends JpaRepository<Deck, UUID> {

    /**
     * Buscar todos los mazos de un usuario (paginado)
     */
    Page<Deck> findByUser_Id(UUID userId, Pageable pageable);

    /**
     * Buscar mazos públicos (paginado)
     */
    Page<Deck> findByIsPublicTrue(Pageable pageable);

    /**
     * Buscar mazos del usuario O mazos públicos (paginado)
     * 
     * Útil para mostrar "mis mazos + mazos públicos de otros"
     */
    @Query("""
        SELECT d FROM Deck d
        WHERE d.user.id = :userId OR d.isPublic = true
        """)
    Page<Deck> findByUserIdOrPublic(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Buscar mazos por título (case-insensitive, paginado)
     * 
     * Usa LOWER para búsqueda case-insensitive
     * Usa LIKE para búsqueda parcial
     */
    @Query("""
        SELECT d FROM Deck d
        WHERE (d.user.id = :userId OR d.isPublic = true)
        AND LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%'))
        """)
    Page<Deck> findByUserIdOrPublicAndTitleContaining(
        @Param("userId") UUID userId,
        @Param("search") String search,
        Pageable pageable
    );

    /**
     * Buscar mazos por tags (paginado)
     * 
     * Usa operador @> de PostgreSQL para arrays
     * Ejemplo: tags @> ARRAY['matemáticas'] busca mazos que tengan 'matemáticas'
     */
    @Query(
        value = """
            SELECT * FROM decks
            WHERE (user_id = :userId OR is_public = true)
            AND tags @> CAST(:tags AS TEXT[])
            ORDER BY created_at DESC
            """,
        countQuery = """
            SELECT COUNT(*) FROM decks
            WHERE (user_id = :userId OR is_public = true)
            AND tags @> CAST(:tags AS TEXT[])
            """,
        nativeQuery = true
    )
    Page<Deck> findByUserIdOrPublicAndTags(
        @Param("userId") UUID userId,
        @Param("tags") String[] tags,
        Pageable pageable
    );

    /**
     * Buscar un deck específico y verificar permisos
     * 
     * Solo devuelve el deck si:
     * - Es del usuario actual, O
     * - Es público
     */
    @Query("""
        SELECT d FROM Deck d
        WHERE d.id = :deckId
        AND (d.user.id = :userId OR d.isPublic = true)
        """)
    Optional<Deck> findByIdAndUserIdOrPublic(
        @Param("deckId") UUID deckId,
        @Param("userId") UUID userId
    );

    /**
     * Verificar si un deck pertenece a un usuario
     */
    boolean existsByIdAndUser_Id(UUID deckId, UUID userId);
}