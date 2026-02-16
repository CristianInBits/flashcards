import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { deckService } from '@/services/deckService';
import { DeckCard } from '@/components/deck/DeckCard';
import { SearchBar } from '@/components/common/SearchBar';
import { Pagination } from '@/components/common/Pagination';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import type { DeckResponse, PageResponse } from '@/types/deck.types';
import { useAuth } from '@/context/AuthContext';


export const DeckList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [decks, setDecks] = useState<PageResponse<DeckResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');

    /**
     * Cargar mazos del servidor
     */
    const loadDecks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await deckService.getDecks({
                page,
                size: 12,
                search: search || undefined,
            });

            setDecks(data);
        } catch (err) {
            console.error('Error al cargar mazos:', err);
            setError('Error al cargar los mazos. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    // Cargar mazos al montar y cuando cambien los filtros
    useEffect(() => {
        loadDecks();
    }, [loadDecks]);

    /**
     * Manejar búsqueda (viene del SearchBar con debounce)
     */
    const handleSearch = (query: string) => {
        setSearch(query);
        setPage(0);
    };

    /**
     * Manejar cambio de página
     */
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Eliminar un deck
     */
    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este mazo? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await deckService.deleteDeck(id);

            if (decks?.content.length === 1 && page > 0) {
                setPage(page - 1);
            } else {
                loadDecks();
            }
        } catch (err) {
            console.error('Error al eliminar deck:', err);
            alert('Error al eliminar el mazo. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mis Mazos</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Gestiona tus mazos de flashcards
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate('/decks/new')}
                            variant="primary"
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Crear Mazo
                            </span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Contenido */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Barra de búsqueda */}
                <div className="mb-6 rounded-2xl shadow">
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Buscar mazos por título..."
                    />
                </div>

                {/* Error */}
                {error && (
                    <Alert variant="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Spinner size="lg" />
                        <p className="mt-4 text-gray-600">Cargando mazos...</p>
                    </div>
                )}

                {/* Lista de mazos */}
                {!isLoading && decks && (
                    <>
                        {decks.content.length === 0 ? (
                            // Empty state
                            <div className="text-center py-12">
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
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    {search ? 'No se encontraron mazos' : 'No tienes mazos'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {search
                                        ? 'Intenta con otra búsqueda'
                                        : 'Comienza creando tu primer mazo de flashcards'}
                                </p>
                                {!search && (
                                    <div className="mt-6">
                                        <Button onClick={() => navigate('/decks/new')}>
                                            Crear mi primer mazo
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Grid de mazos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {decks.content.map((deck) => (
                                        <DeckCard
                                            key={deck.id}
                                            deck={deck}
                                            onDelete={handleDelete}
                                            isOwner={deck.owner.id === user?.id}
                                            showActions={deck.owner.id === user?.id}
                                        />
                                    ))}
                                </div>

                                {/* Paginación */}
                                <Pagination
                                    currentPage={decks.page}
                                    totalPages={decks.totalPages}
                                    onPageChange={handlePageChange}
                                />

                                {/* Info de resultados */}
                                <div className="mt-4 text-center text-sm text-gray-600">
                                    Mostrando {decks.content.length} de {decks.totalElements} mazos
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};