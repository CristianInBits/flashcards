import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* ==================== RUTAS PRIVADAS ==================== */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />

            {/* ==================== RUTAS PÚBLICAS ==================== */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />

            {/* ==================== RUTA 404 ==================== */}
            <Route
                path="*"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-gray-900">404</h1>
                            <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
                            {/* MEJORA: Usar Link en lugar de etiqueta <a> */}
                            <Link
                                to="/"
                                className="mt-6 inline-block text-primary hover:text-blue-600 font-medium transition-colors"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
};