import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header con info del usuario */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Dashboard
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Bienvenido, {user?.username}
                            </p>
                        </div>
                        <Button variant="secondary" onClick={handleLogout}>
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Información del Usuario
                    </h2>

                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-500">ID:</span>
                            <p className="text-gray-900 font-mono text-sm">{user?.id}</p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-500">Email:</span>
                            <p className="text-gray-900">{user?.email}</p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-500">Username:</span>
                            <p className="text-gray-900">{user?.username}</p>
                        </div>

                        <div>
                            <span className="text-sm font-medium text-gray-500">Cuenta creada:</span>
                            <p className="text-gray-900">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Mensaje temporal */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            🎉 <strong>¡Autenticación funcionando!</strong> Esta es una página temporal.
                            En las siguientes fases crearemos la funcionalidad de mazos y tarjetas aquí.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};