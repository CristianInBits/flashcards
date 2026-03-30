// ========== REQUEST TYPES ==========

export interface CardRequest {
    front: string;
    back: string;
}

// ========== RESPONSE TYPES ==========

export interface CardResponse {
    id: string;
    deckId: string;
    front: string;
    back: string;
    createdAt: string;  // ISO 8601
    updatedAt: string;  // ISO 8601
}

// ========== FORM TYPES ==========

export interface CardFormData {
    front: string;
    back: string;
}
