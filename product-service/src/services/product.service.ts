import prisma from '../config/db';

interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string; // <-- BU SATIR ÇOK ÖNEMLİ
}

// YENİ: Güncelleme işlemi için bazı alanlar boş (opsiyonel) gelebileceğinden yeni bir DTO oluşturduk
interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export const createProduct = async (data: CreateProductDto) => {
  return await prisma.product.create({
    data,
  });
};

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' } // En yeni ürünler en üstte gelsin
  });
};

// ID'ye göre tek bir ürün getiren fonksiyon
export const getProductById = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id: id },
  });
};

// --- 🚀 YENİ EKLENEN FONKSİYONLAR (GÜNCELLEME VE SİLME) ---

// ID'ye göre ürünü güncelleyen fonksiyon (PUT)
export const updateProduct = async (id: string, data: UpdateProductDto) => {
  return await prisma.product.update({
    where: { id: id }, // Hangi ürün güncellenecek?
    data: data,        // Yeni veriler neler?
  });
};

// ID'ye göre ürünü silen fonksiyon (DELETE)
export const deleteProduct = async (id: string) => {
  return await prisma.product.delete({
    where: { id: id }, // Hangi ürün silinecek?
  });
};

export const decreaseStock = async (productId: string, quantity: number) => {
  return await prisma.product.update({
    where: { id: productId },
    data: {
      stock: {
        decrement: quantity // Prisma'nın bu özelliği sayesinde stoktan otomatik düşer
      }
    }
  });
};