import api from './api';
import type { CardRequest, CardResponse } from '@/types/card.types';

export const cardService = {

    async createCard(deckId: string, data: CardRequest): Promise<CardResponse> {
        const response = await api.post<CardResponse>(`/decks/${deckId}/cards`, data);
        return response.data;
    },

    async getCards(deckId: string): Promise<CardResponse[]> {
        const response = await api.get<CardResponse[]>(`/decks/${deckId}/cards`);
        return response.data;
    },

    async getCard(deckId: string, cardId: string): Promise<CardResponse> {
        const response = await api.get<CardResponse>(`/decks/${deckId}/cards/${cardId}`);
        return response.data;
    },

    async updateCard(deckId: string, cardId: string, data: CardRequest): Promise<CardResponse> {
        const response = await api.put<CardResponse>(`/decks/${deckId}/cards/${cardId}`, data);
        return response.data;
    },

    async deleteCard(deckId: string, cardId: string): Promise<void> {
        await api.delete(`/decks/${deckId}/cards/${cardId}`);
    },
};
