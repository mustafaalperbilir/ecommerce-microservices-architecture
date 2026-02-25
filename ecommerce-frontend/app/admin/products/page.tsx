"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { PackagePlus, Loader2, Tag, FileText, DollarSign, Layers, ArrowLeft, Trash2, Edit, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export default function AdminProductsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Veri State'leri
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State'leri
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setIsMounted(true);
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchProducts();
    } else if (isMounted) {
      router.replace('/');
    }
  }, [isMounted, isAuthenticated, user, router]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Ürünler çekilemedi:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    
    if (image) {
      formData.append('image', image);
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:4000/api/products/${editingId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage({ type: 'success', text: 'Ürün başarıyla güncellendi! 🔄' });
      } else {
        await axios.post('http://localhost:4000/api/products', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setMessage({ type: 'success', text: 'Ürün başarıyla eklendi! 🎉' });
      }

      resetForm();
      fetchProducts();

    } catch (error) {
      console.error("İşlem hatası:", error);
      setMessage({ type: 'error', text: 'İşlem başarısız oldu. Sunucu bağlantısını veya yetkinizi kontrol edin.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:4000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
      setMessage({ type: 'success', text: 'Ürün başarıyla silindi! 🗑️' });
    } catch (error) {
      console.error("Silme hatası:", error);
      setMessage({ type: 'error', text: 'Ürün silinemedi.' });
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  if (!isMounted || !isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <main className="min-h-[85vh] bg-gray-50 py-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Başlık ve Navigasyon */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center">
              <PackagePlus className="mr-3 text-orange-500" size={32} />
              Ürün Yönetimi
            </h1>
           <div className="flex items-center space-x-4 mt-4">
            <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors pb-1">
                📊 Ana Panel
            </Link>
            {/* 🚀 DİKKAT: Burada Ürün Yönetimi AKTİF (Renkli) */}
            <Link href="/admin/products" className="text-sm font-bold border-b-2 border-orange-500 text-orange-600 pb-1">
                📦 Ürün Yönetimi
            </Link>
            <Link href="/admin/orders" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors pb-1">
                🛒 Sipariş Yönetimi
            </Link>
          </div>
          </div>
          <Link href="/" className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Vitrine Dön
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editingId ? '✍️ Ürünü Güncelle' : '➕ Yeni Ürün Ekle'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-sm text-red-500 hover:underline font-bold">
                İptal Et / Yeni Eklemeye Dön
              </button>
            )}
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Adı</label>
                <div className="relative">
                  <Tag size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fiyat (₺)</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Açıklaması</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={2} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stok Adedi</label>
                <div className="relative">
                  <Layers size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ürün Görseli</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors p-4 flex items-center justify-center cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Resim Seçmek İçin Tıklayın"
                />
                <div className="flex flex-col items-center text-gray-500 pointer-events-none">
                  <ImageIcon size={32} className="mb-2 text-orange-400" />
                  {image ? (
                    <span className="font-bold text-orange-600 truncate max-w-xs">{image.name} seçildi</span>
                  ) : (
                    <span className="font-medium text-sm">Resim seçmek için tıklayın veya sürükleyin</span>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center space-x-2 shadow-lg mt-6 ${loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : (editingId ? <Save size={20} /> : <PackagePlus size={20} />)}
              <span>{loading ? 'İşleniyor (Görsel Yükleniyor Olabilir)...' : (editingId ? 'Değişiklikleri Kaydet' : 'Ürünü Sisteme Ekle')}</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Mevcut Ürünler ({products.length})</h2>
          </div>
          
          {loadingData ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-sm text-gray-500">
                    <th className="p-4 font-bold">Görsel</th>
                    <th className="p-4 font-bold">Ürün Adı</th>
                    <th className="p-4 font-bold">Fiyat</th>
                    <th className="p-4 font-bold">Stok</th>
                    <th className="p-4 font-bold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs">Yok</div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-gray-800">{product.name}</td>
                      <td className="p-4 font-black text-gray-900">{product.price} ₺</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock} Adet
                        </span>
                      </td>
                      <td className="p-4 flex justify-end space-x-2">
                        <button onClick={() => handleEditClick(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">Henüz hiç ürün eklenmemiş.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}