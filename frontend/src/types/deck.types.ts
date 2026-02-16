// ========== REQUEST TYPES ==========

export interface DeckRequest {
    title: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
}

export interface UpdateDeckRequest {
    title?: string;
    description?: string;
    tags?: string[] | null;  // undefined = no cambiar, [] = limpiar, [...] = reemplazar
    isPublic?: boolean;
}

// ========== RESPONSE TYPES ==========

export interface OwnerInfo {
    id: string;
    username: string;
}

export interface DeckResponse {
    id: string;
    title: string;
    description: string | null;
    tags: string[];
    isPublic: boolean;
    cardCount: number;
    owner: OwnerInfo;
    createdAt: string;  // ISO 8601
    updatedAt: string;  // ISO 8601
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

// ========== FILTER TYPES ==========

export interface DeckFilters {
    page?: number;
    size?: number;
    search?: string;
    tags?: string[];
    onlyPublic?: boolean;
}

// ========== FORM TYPES ==========

export interface DeckFormData {
    title: string;
    description: string;
    tags: string;  // Comma-separated para el input
    isPublic: boolean;
}