package com.flashcards.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad Card - Representa una tarjeta (flashcard)
 * 
 * Una card pertenece a un deck y tiene contenido en front (frente) y back
 * (reverso).
 * El contenido puede incluir LaTeX para fórmulas matemáticas.
 */
@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Deck al que pertenece esta tarjeta
     * ManyToOne: Muchas tarjetas pueden pertenecer a un deck
     * FetchType.LAZY: No carga el deck automáticamente (optimización)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    private Deck deck;

    /**
     * Contenido del frente de la tarjeta
     * Puede incluir texto, LaTeX (ej: $E = mc^2$), o ambos
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "El frente de la tarjeta es obligatorio")
    private String front;

    /**
     * Contenido del reverso de la tarjeta
     * Puede incluir texto, LaTeX (ej: $$\int_0^\infty e^{-x} dx = 1$$), o ambos
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "El reverso de la tarjeta es obligatorio")
    private String back;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Helper para verificar si la tarjeta pertenece a un deck específico
     */
    public boolean belongsToDeck(UUID deckId) {
        return this.deck != null && this.deck.getId().equals(deckId);
    }
}