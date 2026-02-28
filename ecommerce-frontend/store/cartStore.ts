import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;      // 👈 Backend'den imageUrl olarak gelebilir diye ekledik
  category?: string;
  description?: string;   // 👈 İşte o kırmızı hatayı yok edecek sihirli kelime!
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void; // Tamamen silme
  decreaseQuantity: (id: string) => void; // Miktarı 1 azaltma
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  clearCart: () => {
    set({ cart: [] }); // 👈 Sepeti sıfırlayan kod
  },

  addToCart: (product) => {
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
    });
  },

  removeFromCart: (id) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    }));
  },

  decreaseQuantity: (id) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  },

  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
}));