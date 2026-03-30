import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deckService } from '@/services/deckService';
import { cardService } from '@/services/cardService';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import { CardItem } from '@/components/card/CardItem';
import type { DeckResponse } from '@/types/deck.types';
import type { CardResponse } from '@/types/card.types';
import { useAuth } from '@/context/AuthContext';

export const DeckDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [deck, setDeck] = useState<DeckResponse | null>(null);
    const [cards, setCards] = useState<CardResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCards, setIsLoadingCards] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadDeck(id);
        }
    }, [id]);

    const loadDeck = async (deckId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await deckService.getDeckById(deckId);
            setDeck(data);
            // Cargar tarjetas después de tener el deck
            await loadCards(deckId);
        } catch (err: any) {
            console.error('Error al cargar deck:', err);
            setError(
                err.response?.data?.error ||
                'Error al cargar el mazo. Puede que no tengas permiso para verlo.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const loadCards = async (deckId: string) => {
        try {
            setIsLoadingCards(true);
            const data = await cardService.getCards(deckId);
            setCards(data);
        } catch (err: any) {
            console.error('Error al cargar tarjetas:', err);
        } finally {
            setIsLoadingCards(false);
        }
    };

    const handleDeleteCard = async (cardId: string) => {
        if (!id) return;
        if (!window.confirm('¿Eliminar esta tarjeta? Esta acción no se puede deshacer.')) return;

        try {
            await cardService.deleteCard(id, cardId);
            setCards(prev => prev.filter(c => c.id !== cardId));
            // Actualizar contador del deck
            setDeck(prev => prev ? { ...prev, cardCount: prev.cardCount - 1 } : prev);
        } catch (err) {
            console.error('Error al eliminar tarjeta:', err);
            alert('Error al eliminar la tarjeta. Inténtalo de nuevo.');
        }
    };

    const handleDelete = async () => {
        if (!deck || !id) return;

        if (
            !window.confirm(
                '¿Estás seguro de eliminar este mazo? Esta acción no se puede deshacer y eliminará todas sus tarjetas.'
            )
        ) {
            return;
        }

        try {
            await deckService.deleteDeck(id);
            navigate('/decks');
        } catch (err) {
            console.error('Error al eliminar deck:', err);
            alert('Error al eliminar el mazo. Inténtalo de nuevo.');
        }
    };

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando mazo...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error || !deck) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full">
                    <Alert variant="error">
                        {error || 'Mazo no encontrado'}
                    </Alert>
                    <div className="mt-4 text-center">
                        <Button onClick={() => navigate('/decks')}>
                            Volver a mazos
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = deck.owner.id === user?.id;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        to="/decks"
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a mazos
                    </Link>
                </nav>

                {/* Contenido principal */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-8 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {deck.title}
                                    </h1>
                                    <span
                                        className={`px-3 py-1 text-sm font-medium rounded-full ${deck.isPublic
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {deck.isPublic ? 'Público' : 'Privado'}
                                    </span>
                                </div>

                                {deck.description && (
                                    <p className="text-gray-600 mb-4">{deck.description}</p>
                                )}

                                {/* Tags */}
                                {deck.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {deck.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {deck.owner.username}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Creado {new Date(deck.createdAt).toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                            </div>

                            {/* Acciones (solo propietario) */}
                            {isOwner && (
                                <div className="flex items-center gap-2 ml-4">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => navigate(`/decks/${deck.id}/edit`)}
                                    >
                                        Editar
                                    </Button>

                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={handleDelete}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tarjetas */}
                    <div className="px-6 py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Tarjetas ({cards.length})
                            </h2>
                            <div className="flex items-center gap-2">
                                {isOwner && cards.length > 0 && (
                                    <Button variant="secondary" size="sm" onClick={() => navigate(`/decks/${id}/cards/new`)}>
                                        Añadir tarjeta
                                    </Button>
                                )}
                            </div>
                        </div>

                        {isLoadingCards ? (
                            <div className="flex justify-center py-8">
                                <Spinner size="md" />
                            </div>
                        ) : cards.length === 0 ? (
                            // Empty state
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    No hay tarjetas
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {isOwner
                                        ? 'Comienza añadiendo tarjetas a este mazo'
                                        : 'Este mazo no tiene tarjetas todavía'}
                                </p>
                                {isOwner && (
                                    <div className="mt-6">
                                        <Button size="sm" onClick={() => navigate(`/decks/${id}/cards/new`)}>
                                            Añadir tarjeta
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Lista de tarjetas
                            <div className="space-y-3">
                                {cards.map(card => (
                                    <CardItem
                                        key={card.id}
                                        card={card}
                                        isOwner={isOwner}
                                        onEdit={card => navigate(`/decks/${id}/cards/${card.id}/edit`)}
                                        onDelete={handleDeleteCard}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};