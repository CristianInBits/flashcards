import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState<{
        email?: string;
        username?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!formData.email) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.username) {
            newErrors.username = 'El username es obligatorio';
        } else if (formData.username.length < 3) {
            newErrors.username = 'El username debe tener al menos 3 caracteres';
        } else if (formData.username.length > 100) {
            newErrors.username = 'El username no puede tener más de 100 caracteres';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else if (formData.password.length > 50) {
            newErrors.password = 'La contraseña no puede tener más de 50 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
            await register({
                email: formData.email,
                username: formData.username,
                password: formData.password,
            });

            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">

                {/* HEADER VISUAL*/}
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Contenedor del Icono/Logo */}
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 transform rotate-3 hover:rotate-6 transition-transform">
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

                    {/* Título Principal */}
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Crear Cuenta
                    </h1>

                    {/* Subtítulo */}
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Únete a Flashcards y empieza a estudiar.
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* Alert de error */}
                    {error && (
                        <Alert variant="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <div className="space-y-4">
                        {/* Email */}
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

                        {/* Username */}
                        <Input
                            id="username"
                            label="Username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={errors.username}
                            placeholder="usuario123"
                            helperText="Entre 3 y 100 caracteres"
                            autoComplete="username"
                            disabled={isLoading}
                        />

                        {/* Password */}
                        <Input
                            id="password"
                            label="Contraseña"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="••••••••"
                            helperText="Mínimo 6 caracteres"
                            autoComplete="new-password"
                            disabled={isLoading}
                        />

                        {/* Confirm Password */}
                        <Input
                            id="confirmPassword"
                            label="Confirmar Contraseña"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Submit button */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full shadow-md"
                    >
                        Registrarse
                    </Button>


                    {/* Link a login */}
                    <div className="text-center text-sm pt-2">
                        <span className="text-gray-500">¿Ya tienes cuenta? </span>
                        <Link
                            to="/login"
                            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Inicia sesión aquí
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};