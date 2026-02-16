import { Link } from 'react-router-dom';
import type { DeckResponse } from '@/types/deck.types';

interface DeckCardProps {
    deck: DeckResponse;
    onDelete?: (id: string) => void;
    showActions?: boolean;
    isOwner?: boolean;
}

export const DeckCard = (
    { deck, onDelete, showActions = true, isOwner = true }: DeckCardProps
) => {

    return (
        <div className="bg-white rounded-2xl shadow-xl hover:shadow-md transition-shadow p-6 border border-gray-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <Link
                    to={`/decks/${deck.id}`}
                    className="flex-1 min-w-0"
                >
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors truncate">
                        {deck.title}
                    </h3>
                </Link>

                {/* Badge público/privado */}
                <span
                    className={`ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${deck.isPublic
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {deck.isPublic ? 'Público' : 'Privado'}
                </span>
            </div>

            {/* Descripción */}
            {deck.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {deck.description}
                </p>
            )}

            {/* Tags */}
            {deck.tags && deck.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {deck.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                {/* Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {deck.cardCount} tarjetas
                    </span>

                    {!isOwner && (
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {deck.owner.username}
                        </span>
                    )}
                </div>

                {/* Acciones */}
                {showActions && isOwner && (
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/decks/${deck.id}/edit`}
                            className="text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                            Editar
                        </Link>
                        {onDelete && (
                            <button 
                                type="button"
                                onClick={() => onDelete(deck.id)}
                                className="text-sm text-red-600 hover:text-red-700 transition-colors"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};