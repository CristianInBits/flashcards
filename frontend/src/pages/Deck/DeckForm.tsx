import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deckService } from '@/services/deckService';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { DeckFormData } from '@/types/deck.types';

export const DeckForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<DeckFormData>({
        title: '',
        description: '',
        tags: '',
        isPublic: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDeck, setIsLoadingDeck] = useState(isEditMode);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{
        title?: string;
        description?: string;
    }>({});

    useEffect(() => {
        if (isEditMode && id) {
            loadDeck(id);
        }
    }, [isEditMode, id]);

    const loadDeck = async (deckId: string) => {
        try {
            setIsLoadingDeck(true);
            const deck = await deckService.getDeckById(deckId);

            setFormData({
                title: deck.title,
                description: deck.description || '',
                tags: deck.tags.join(', '),
                isPublic: deck.isPublic,
            });
        } catch (err) {
            console.error('Error al cargar deck:', err);
            setError('Error al cargar el mazo. Redirigiendo...');
            setTimeout(() => navigate('/decks'), 2000);
        } finally {
            setIsLoadingDeck(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es obligatorio';
        } else if (formData.title.length > 255) {
            newErrors.title = 'El título no puede tener más de 255 caracteres';
        }

        if (formData.description.length > 500) {
            newErrors.description = 'La descripción no puede tener más de 500 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validate()) {
            return;
        }

        setIsLoading(true);

        try {
            const tagsArray = formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            if (isEditMode && id) {
                await deckService.updateDeck(id, {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    tags: tagsArray.length > 0 ? tagsArray : [],
                    isPublic: formData.isPublic,
                });
            } else {
                await deckService.createDeck({
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    tags: tagsArray.length > 0 ? tagsArray : undefined,
                    isPublic: formData.isPublic,
                });
            }

            navigate('/decks');
        } catch (err: any) {
            console.error('Error al guardar deck:', err);
            setError(
                err.response?.data?.error ||
                'Error al guardar el mazo. Inténtalo de nuevo.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingDeck) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando mazo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => navigate('/decks')}
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a mazos
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Mazo' : 'Crear Nuevo Mazo'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {isEditMode
                            ? 'Modifica los campos que desees actualizar'
                            : 'Completa la información de tu nuevo mazo'}
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error general */}
                        {error && (
                            <Alert variant="error" onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {/* Título */}
                        <Input
                            id="title"
                            label="Título"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            error={errors.title}
                            placeholder="ej: Vocabulario Inglés B2"
                            disabled={isLoading}
                            required
                        />

                        {/* Descripción */}
                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Descripción (opcional)
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="ej: Vocabulario para el examen de Cambridge B2"
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                {formData.description.length}/500 caracteres
                            </p>
                        </div>

                        {/* Tags */}
                        <Input
                            id="tags"
                            label="Etiquetas (opcional)"
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="ej: inglés, vocabulario, cambridge"
                            helperText="Separa las etiquetas con comas"
                            disabled={isLoading}
                        />

                        {/* Público */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="isPublic"
                                    name="isPublic"
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="isPublic" className="font-medium text-gray-700">
                                    Mazo público
                                </label>
                                <p className="text-sm text-gray-500">
                                    Otros usuarios podrán ver y estudiar este mazo
                                </p>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex items-center gap-3 pt-4 border-t">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="flex-1"
                            >
                                {isEditMode ? 'Guardar Cambios' : 'Crear Mazo'}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/decks')}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};