import axios from 'axios';
import Link from 'next/link'; // YENİ EKLENDİ

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default async function Home() {
  let products: Product[] = []; 
  
  try {
    const response = await axios.get('http://localhost:4000/api/products');
    products = response.data;
  } catch (error) {
    console.error("Gateway'e ulaşılamadı. Docker çalışıyor mu?", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Öne Çıkan Ürünler
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <p className="text-gray-500 text-lg">Şu an vitrinde ürün yok...</p>
          ) : (
            products.map((product: Product) => (
              /* YENİ EKLENDİ: Tüm kartı Link ile sardık */
              <Link href={`/products/${product.id}`} key={product.id} className="block group">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden transform group-hover:-translate-y-1">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 truncate group-hover:text-blue-600 transition-colors">{product.name}</h2>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-end mt-4">
                      <span className="text-2xl font-black text-gray-900">{product.price} ₺</span>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Stok: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}