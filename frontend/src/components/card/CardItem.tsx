import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import type { CardResponse } from '@/types/card.types';

interface CardItemProps {
    card: CardResponse;
    isOwner: boolean;
    onEdit: (card: CardResponse) => void;
    onDelete: (cardId: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, isOwner, onEdit, onDelete }) => {
    const [showBack, setShowBack] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            {/* Frente */}
            <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Frente</p>
                <p className="text-gray-900 whitespace-pre-wrap">{card.front}</p>
            </div>

            {/* Reverso */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Reverso</p>
                    <button
                        onClick={() => setShowBack(!showBack)}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {showBack ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>
                {showBack ? (
                    <p className="text-gray-900 whitespace-pre-wrap">{card.back}</p>
                ) : (
                    <p className="text-gray-400 italic text-sm">Haz clic en "Mostrar" para ver la respuesta</p>
                )}
            </div>

            {/* Acciones (solo propietario) */}
            {isOwner && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(card)}
                    >
                        Editar
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(card.id)}
                    >
                        Eliminar
                    </Button>
                </div>
            )}
        </div>
    );
};
