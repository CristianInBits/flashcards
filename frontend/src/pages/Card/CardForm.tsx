import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cardService } from '@/services/cardService';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { CardFormData } from '@/types/card.types';

export const CardForm: React.FC = () => {
    const { deckId, cardId } = useParams<{ deckId: string; cardId: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(cardId);

    const [formData, setFormData] = useState<CardFormData>({ front: '', back: '' });
    const [errors, setErrors] = useState<Partial<CardFormData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCard, setIsLoadingCard] = useState(isEditing);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing && deckId && cardId) {
            loadCard(deckId, cardId);
        }
    }, [deckId, cardId, isEditing]);

    const loadCard = async (dId: string, cId: string) => {
        try {
            setIsLoadingCard(true);
            const card = await cardService.getCard(dId, cId);
            setFormData({ front: card.front, back: card.back });
        } catch (err: any) {
            console.error('Error al cargar tarjeta:', err);
            setError(err.response?.data?.error || 'Error al cargar la tarjeta.');
        } finally {
            setIsLoadingCard(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<CardFormData> = {};
        if (!formData.front.trim()) {
            newErrors.front = 'El frente es obligatorio';
        }
        if (!formData.back.trim()) {
            newErrors.back = 'El reverso es obligatorio';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof CardFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !deckId) return;

        try {
            setIsLoading(true);
            setError(null);

            if (isEditing && cardId) {
                await cardService.updateCard(deckId, cardId, formData);
            } else {
                await cardService.createCard(deckId, formData);
            }

            navigate(`/decks/${deckId}`);
        } catch (err: any) {
            console.error('Error al guardar tarjeta:', err);
            setError(err.response?.data?.error || 'Error al guardar la tarjeta. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingCard) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando tarjeta...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <Link
                        to={`/decks/${deckId}`}
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver al mazo
                    </Link>
                </nav>

                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        {isEditing ? 'Editar tarjeta' : 'Nueva tarjeta'}
                    </h1>

                    {error && (
                        <div className="mb-6">
                            <Alert variant="error" onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Frente
                            </label>
                            <textarea
                                rows={4}
                                value={formData.front}
                                onChange={e => handleChange('front', e.target.value)}
                                disabled={isLoading}
                                placeholder="Pregunta o concepto..."
                                className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                    disabled:bg-gray-50 disabled:text-gray-500 resize-none transition-colors
                                    ${errors.front ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.front && (
                                <p className="mt-1 text-sm text-red-600">{errors.front}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reverso
                            </label>
                            <textarea
                                rows={4}
                                value={formData.back}
                                onChange={e => handleChange('back', e.target.value)}
                                disabled={isLoading}
                                placeholder="Respuesta o definición..."
                                className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                    disabled:bg-gray-50 disabled:text-gray-500 resize-none transition-colors
                                    ${errors.back ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.back && (
                                <p className="mt-1 text-sm text-red-600">{errors.back}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate(`/decks/${deckId}`)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                            >
                                {isEditing ? 'Guardar cambios' : 'Crear tarjeta'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
