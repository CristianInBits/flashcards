import React, { useState } from 'react';

interface FlashCardProps {
    front: string;
    back: string;
}

export const FlashCard: React.FC<FlashCardProps> = ({ front, back }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="w-full cursor-pointer select-none"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '320px',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s ease',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Frente */}
                <div
                    className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Frente</p>
                    <p className="text-xl text-gray-900 text-center whitespace-pre-wrap">{front}</p>
                    <p className="absolute bottom-5 text-xs text-gray-400">Haz clic para ver la respuesta</p>
                </div>

                {/* Reverso */}
                <div
                    className="absolute inset-0 bg-blue-50 rounded-2xl shadow-lg border border-blue-200 flex flex-col items-center justify-center p-8"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-4">Reverso</p>
                    <p className="text-xl text-gray-900 text-center whitespace-pre-wrap">{back}</p>
                    <p className="absolute bottom-5 text-xs text-blue-400">Haz clic para volver al frente</p>
                </div>
            </div>
        </div>
    );
};
