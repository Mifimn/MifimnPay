"use client";

import { create } from 'zustand';

export interface Product {
  id: number | string;
  name: string;
  price: string | number;
  img?: string;
  image_url?: string;
  quantity?: number;
  wholesale_price?: number; 
  moq?: number;             
  stock?: number;           
}

interface CartState {
  basket: Product[];
  isOpen: boolean;
  isProcessing: boolean;
  shippingFee: number;
  paymentMethod: 'paystack' | 'manual';
  deliveryDetails: {
    state: string;
    lga: string;
    method: 'landmark' | 'park' | 'whatsapp';
    location: string;
  };

  setProcessing: (val: boolean) => void;
  toggleCart: () => void;
  addToBasket: (product: Product, quantityToAdd?: number) => void;
  removeFromBasket: (id: number | string) => void;
  clearCart: () => void;
  setPaymentMethod: (method: 'paystack' | 'manual') => void;
  setLogistics: (details: Partial<CartState['deliveryDetails']>, fee: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  basket: [],
  isOpen: false,
  isProcessing: false,
  shippingFee: 0,
  paymentMethod: 'manual',
  deliveryDetails: { state: '', lga: '', method: 'whatsapp', location: '' },

  setProcessing: (val) => set({ isProcessing: val }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  // --- THE FIXED LOGIC ---
  addToBasket: (product, quantityToAdd = 1) => set((state) => {
    const existingItem = state.basket.find(item => item.id === product.id);

    if (existingItem) {
      // If the item is already in the cart, update it by adding the new quantity
      return {
        basket: state.basket.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 0) + quantityToAdd }
            : item
        )
      };
    }

    // If it's a completely new item, add it with the requested quantity
    return { 
      basket: [...state.basket, { ...product, quantity: quantityToAdd }] 
    };
  }),

  removeFromBasket: (id) => set((state) => ({
    basket: state.basket.filter(item => item.id !== id)
  })),

  clearCart: () => set({ 
    basket: [], 
    shippingFee: 0, 
    deliveryDetails: { state: '', lga: '', method: 'whatsapp', location: '' } 
  }),

  setLogistics: (details, fee) => set((state) => ({
    deliveryDetails: { ...state.deliveryDetails, ...details },
    shippingFee: fee
  })),
}));