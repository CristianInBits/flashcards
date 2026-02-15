CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_decks_is_public ON decks(is_public);
CREATE INDEX idx_decks_tags ON decks USING GIN(tags);  -- GIN index para arrays

-- Comentarios para documentación
COMMENT ON TABLE decks IS 'Tabla de mazos de flashcards';
COMMENT ON COLUMN decks.id IS 'Identificador único UUID';
COMMENT ON COLUMN decks.user_id IS 'Usuario propietario del mazo';
COMMENT ON COLUMN decks.title IS 'Título del mazo';
COMMENT ON COLUMN decks.description IS 'Descripción opcional del mazo';
COMMENT ON COLUMN decks.tags IS 'Etiquetas del mazo (array de strings)';
COMMENT ON COLUMN decks.is_public IS 'Si el mazo es visible para otros usuarios';