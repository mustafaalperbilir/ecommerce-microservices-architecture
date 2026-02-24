"use client";

import { ShoppingCart } from 'lucide-react';
import { useCartStore, Product } from '@/store/cartStore';

export default function AddToCartButton({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button 
      onClick={() => addToCart(product)}
      className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 shadow-lg active:scale-95"
    >
      <ShoppingCart size={24} />
      <span>Sepete Ekle</span>
    </button>
  );
}