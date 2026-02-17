CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_cards_deck_id ON cards(deck_id);

-- Comentarios para documentación
COMMENT ON TABLE cards IS 'Tabla de tarjetas (flashcards)';
COMMENT ON COLUMN cards.id IS 'Identificador único UUID';
COMMENT ON COLUMN cards.deck_id IS 'Mazo al que pertenece la tarjeta';
COMMENT ON COLUMN cards.front IS 'Contenido del frente de la tarjeta (pregunta/término)';
COMMENT ON COLUMN cards.back IS 'Contenido del reverso de la tarjeta (respuesta/definición)';