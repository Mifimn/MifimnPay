"use client";

import { create } from 'zustand';

/**
 * Interface for Modal configuration options
 */
interface ModalOptions {
  title?: string;
  message?: string;
  type?: 'alert' | 'confirm' | 'success' | 'error';
  onConfirm?: () => void;
}

/**
 * Interface for the Modal Store State and Actions
 */
interface ModalState extends ModalOptions {
  isOpen: boolean;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: 'alert',
  onConfirm: undefined,

  /**
   * openModal
   * Triggers the global modal with specific titles, messages, and callbacks.
   */
  openModal: (options) => set({ 
    isOpen: true, 
    title: options.title || '',
    message: options.message || '',
    type: options.type || 'alert',
    onConfirm: options.onConfirm 
  }),

  /**
   * closeModal
   * Resets the modal state to prevent data leaking between different popups.
   */
  closeModal: () => set({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'alert',
    onConfirm: undefined 
  }),
}));
