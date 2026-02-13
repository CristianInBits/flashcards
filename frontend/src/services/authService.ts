import api from './api';
import type {
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse
} from '@/types/auth.types';

/**
 * AuthService - Funciones para interactuar con endpoints de autenticación
 */

export const authService = {
    /**
     * Registrar nuevo usuario
     * 
     * @param data - Email, username y password
     * @returns Promise con token y datos del usuario
     * @throws AxiosError con detalles del error (409, 400, etc.)
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * Login de usuario existente
     * 
     * @param data - Email y password
     * @returns Promise con token y datos del usuario
     * @throws AxiosError con detalles del error (401, 400, etc.)
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    /**
     * Obtener información del usuario actual
     * 
     * Requiere estar autenticado (token en localStorage)
     * 
     * @returns Promise con datos del usuario
     * @throws AxiosError si no está autenticado (401)
     */
    async getCurrentUser(): Promise<UserResponse> {
        const response = await api.get<UserResponse>('/users/me');
        return response.data;
    },
};