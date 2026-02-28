'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore, Product } from '@/store/cartStore';

export default function AddToCartButton({ product }: { product: Product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button
      onClick={() => addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        // Backend resmi 'image' olarak da 'imageUrl' olarak da yollasa yakalayacak
        image: product.image || product.imageUrl, 
        // Backend alt başlığı 'category' olarak da 'description' olarak da yollasa yakalayacak
        category: product.category || product.description 
      })}
      className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 shadow-lg active:scale-95"
    >
      <ShoppingCart size={24} />
      <span>Sepete Ekle</span>
    </button>
  );
}