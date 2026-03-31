import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cardService } from '@/services/cardService';
import { deckService } from '@/services/deckService';
import { FlashCard } from '@/components/flashcard/FlashCard';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import type { CardResponse } from '@/types/card.types';
import type { DeckResponse } from '@/types/deck.types';

export const StudyMode: React.FC = () => {
    const { deckId } = useParams<{ deckId: string }>();
    const navigate = useNavigate();

    const [deck, setDeck] = useState<DeckResponse | null>(null);
    const [cards, setCards] = useState<CardResponse[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (deckId) {
            loadData(deckId);
        }
    }, [deckId]);

    const loadData = async (id: string) => {
        try {
            setIsLoading(true);
            const [deckData, cardsData] = await Promise.all([
                deckService.getDeckById(id),
                cardService.getCards(id),
            ]);
            setDeck(deckData);
            setCards(cardsData);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al cargar el mazo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFinished(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full">
                    <Alert variant="error">{error}</Alert>
                    <div className="mt-4 text-center">
                        <Button onClick={() => navigate('/decks')}>Volver a mazos</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Este mazo no tiene tarjetas para estudiar.</p>
                    <Button onClick={() => navigate(`/decks/${deckId}`)}>Volver al mazo</Button>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/decks/${deckId}`)}
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {deck?.title}
                    </button>
                    <span className="text-sm font-medium text-gray-500">
                        {currentIndex + 1} / {cards.length}
                    </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
                    <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {isFinished ? (
                    /* Pantalla de finalización */
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Sesión completada!</h2>
                        <p className="text-gray-600 mb-8">
                            Repasaste {cards.length} tarjeta{cards.length !== 1 ? 's' : ''} de "{deck?.title}"
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button variant="secondary" onClick={handleRestart}>
                                Repetir sesión
                            </Button>
                            <Button onClick={() => navigate(`/decks/${deckId}`)}>
                                Volver al mazo
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* FlashCard — key fuerza reset del flip al cambiar de tarjeta */}
                        <FlashCard
                            key={currentCard.id}
                            front={currentCard.front}
                            back={currentCard.back}
                        />

                        {/* Navegación */}
                        <div className="flex justify-between items-center mt-8">
                            <Button
                                variant="secondary"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                            >
                                Anterior
                            </Button>
                            <Button onClick={handleNext}>
                                {currentIndex === cards.length - 1 ? 'Finalizar' : 'Siguiente'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
