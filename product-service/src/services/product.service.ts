import prisma from '../config/db';

interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
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