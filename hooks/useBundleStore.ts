
import { create } from 'zustand';

// Define the Sticker interface based on bundle_stickers table
export interface Sticker {
    id: string;
    name: string;
    image_url: string;
    category: string;
}

interface BundleState {
    selectedStickers: Sticker[];
    currentCategory: string;
    addToBundle: (sticker: Sticker) => void;
    removeFromBundle: (stickerId: string) => void;
    setCategory: (category: string) => void;
    clearBundle: () => void;
}

export const useBundleStore = create<BundleState>((set) => ({
    selectedStickers: [],
    currentCategory: 'All',
    addToBundle: (sticker) =>
        set((state) => ({
            selectedStickers: [...state.selectedStickers, sticker],
        })),
    removeFromBundle: (stickerId) =>
        set((state) => ({
            selectedStickers: state.selectedStickers.filter((s) => s.id !== stickerId),
        })),
    setCategory: (category) => set({ currentCategory: category }),
    clearBundle: () => set({ selectedStickers: [] }),
}));
