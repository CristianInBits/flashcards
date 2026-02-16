import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { DeckList } from '@/pages/Deck/DeckList';
import { DeckForm } from '@/pages/Deck/DeckForm';
import { DeckDetail } from '@/pages/Deck/DeckDetail';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* ==================== RUTAS PRIVADAS ==================== */}

            {/* Dashboard (redirige a /decks) */}
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />

            {/* Lista de mazos */}
            <Route
                path="/decks"
                element={
                    <PrivateRoute>
                        <DeckList />
                    </PrivateRoute>
                }
            />

            {/* Crear mazo */}
            <Route
                path="/decks/new"
                element={
                    <PrivateRoute>
                        <DeckForm />
                    </PrivateRoute>
                }
            />

            {/* Ver detalles de mazo */}
            <Route
                path="/decks/:id"
                element={
                    <PrivateRoute>
                        <DeckDetail />
                    </PrivateRoute>
                }
            />

            {/* Editar mazo */}
            <Route
                path="/decks/:id/edit"
                element={
                    <PrivateRoute>
                        <DeckForm />
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