import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard - Redirige a la lista de mazos
 * 
 * En el futuro, esta página podría mostrar:
 * - Estadísticas de estudio
 * - Mazos recientes
 * - Progreso
 */
export const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirigir automáticamente a /decks
        navigate('/decks', { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-gray-600">Redirigiendo...</p>
            </div>
        </div>
    );
};