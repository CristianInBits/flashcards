/**
 * Tipos relacionados con autenticación
 * Corresponden a los DTOs del backend
 */

// ========== REQUEST TYPES ==========

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// ========== RESPONSE TYPES ==========

export interface UserResponse {
    id: string;
    email: string;
    username: string;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: UserResponse;
}

// ========== ERROR TYPES ==========

export interface ValidationError {
    [field: string]: string;
}

export interface ApiError {
    error: string;
    message?: string;
    status?: number;
    timestamp?: string;
}

// ========== CONTEXT TYPES ==========

export interface AuthContextType {
    user: UserResponse | null;
    token: string | null;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}