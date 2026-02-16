import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

export const Login: React.FC = () => {
    // ==========================================
    // LÓGICA
    // ==========================================
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!formData.email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

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
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            {/* Contenedor principal estilo tarjeta */}
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">

                {/* HEADER VISUAL */}
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Contenedor del Icono/Logo */}
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 transform rotate-3 hover:rotate-6 transition-transform">
                        {/* Icono de Flashcards (SVG) */}
                        <svg
                            className="w-10 h-10 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>

                    {/* Título Principal de la App */}
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Flashcards
                    </h1>

                    {/* Subtítulo clásico */}
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Bienvenido de nuevo. Accede a tus tarjetas.
                    </p>
                </div>

                {/* Formulario (Sigue igual) */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <Alert variant="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <Input
                            id="email"
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="tu@email.com"
                            autoComplete="email"
                            disabled={isLoading}
                        />

                        <Input
                            id="password"
                            label="Contraseña"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full shadow-md"
                    >
                        Iniciar Sesión
                    </Button>

                    <div className="text-center text-sm pt-2">
                        <span className="text-gray-500">¿No tienes cuenta? </span>
                        <Link
                            to="/register"
                            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Regístrate aquí
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};