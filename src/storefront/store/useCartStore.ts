"use client";

import { create } from 'zustand';

/**
 * Interface for Product data
 * Based on the structure used in the Wholesaler showroom
 */
export interface Product {
  id: number | string;
  name: string;
  price: string | number;
  img: string;
  moq?: string;
  stock?: number;
}

/**
 * Interface for the Cart State and Actions
 */
interface CartState {
  basket: Product[];
  isOpen: boolean;
  isProcessing: boolean; // State for Vortex/Processing transitions
  
  setProcessing: (val: boolean) => void;
  toggleCart: () => void;
  addToBasket: (product: Product) => void;
  removeFromBasket: (id: number | string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  basket: [],
  isOpen: false,
  isProcessing: false, 
  
  // Updates the processing state for transitions
  setProcessing: (val) => set({ isProcessing: val }),
  
  // Toggles the visibility of the CartDrawer
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  
  // Adds a product to the basket if it doesn't already exist
  addToBasket: (product) => set((state) => {
    if (state.basket.find(item => item.id === product.id)) return state;
    return { basket: [...state.basket, product] };
  }),
  
  // Removes a specific product by ID
  removeFromBasket: (id) => set((state) => ({
    basket: state.basket.filter(item => item.id !== id)
  })),
  
  // Resets the basket to an empty state
  clearCart: () => set({ basket: [] }),
}));