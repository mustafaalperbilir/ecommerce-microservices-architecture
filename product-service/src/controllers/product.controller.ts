import { Request, Response } from 'express';
import { createProduct, getAllProducts } from '../services/product.service';
import * as productService from '../services/product.service';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock } = req.body;

    // Basit Validasyon (Gerçekte Joi veya Zod gibi kütüphaneler kullanılır)
    if (!name || price === undefined || stock === undefined) {
      res.status(400).json({ error: 'İsim, fiyat ve stok zorunludur.' });
      return;
    }

    const product = await createProduct({ name, description, price, stock });
    res.status(201).json({ message: 'Ürün başarıyla oluşturuldu', product });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // TypeScript'e bunun string olduğunu garanti ettik
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Ürün getirilirken hata oluştu" });
  }
};