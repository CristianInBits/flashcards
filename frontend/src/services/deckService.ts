import api from './api';
import type {
    DeckRequest,
    UpdateDeckRequest,
    DeckResponse,
    PageResponse,
    DeckFilters,
} from '@/types/deck.types';

export const deckService = {

    async createDeck(data: DeckRequest): Promise<DeckResponse> {
        const response = await api.post<DeckResponse>('/decks', data);
        return response.data;
    },

    async getDeckById(id: string): Promise<DeckResponse> {
        const response = await api.get<DeckResponse>(`/decks/${id}`);
        return response.data;
    },

    async getDecks(filters: DeckFilters = {}): Promise<PageResponse<DeckResponse>> {
        const params = new URLSearchParams();

        if (filters.page !== undefined) {
            params.append('page', filters.page.toString());
        }
        if (filters.size !== undefined) {
            params.append('size', filters.size.toString());
        }
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.tags && filters.tags.length > 0) {
            params.append('tags', filters.tags.join(','));
        }
        if (filters.onlyPublic !== undefined) {
            params.append('onlyPublic', filters.onlyPublic.toString());
        }

        const response = await api.get<PageResponse<DeckResponse>>(
            `/decks?${params.toString()}`
        );
        return response.data;
    },

    async updateDeck(id: string, data: UpdateDeckRequest): Promise<DeckResponse> {
        const response = await api.patch<DeckResponse>(`/decks/${id}`, data);
        return response.data;
    },

    async deleteDeck(id: string): Promise<void> {
        await api.delete(`/decks/${id}`);
    },
};