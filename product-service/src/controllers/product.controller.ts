import { Request, Response } from 'express';
import { createProduct, getAllProducts } from '../services/product.service';
import * as productService from '../services/product.service';

// --- CREATE FONKSİYONU (Görsel Yükleme Desteğiyle Birlikte) ---
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock } = req.body;
    
    // 🛠️ TS hatasını kesin olarak önlemek için req objesini 'any' olarak okuyoruz
    const file = (req as any).file;
    const imageUrl = file ? file.path : null;

    if (!name || price === undefined || stock === undefined) {
      res.status(400).json({ error: 'İsim, fiyat ve stok zorunludur.' });
      return;
    }

    // createProduct servisine imageUrl'i de gönderiyoruz
    const product = await productService.createProduct({ 
      name, 
      description, 
      price: parseFloat(price), 
      stock: parseInt(stock, 10),
      imageUrl 
    });
    
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
    const id = req.params.id as string; 
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Ürün getirilirken hata oluştu" });
  }
};

// --- YENİ EKLENEN FONKSİYONLAR (GÜNCELLEME VE SİLME) ---

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const updateData: any = { ...req.body };
    
    // 🛠️ FormData'dan gelenleri sayıya çeviriyoruz (Çok Önemli!)
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock, 10);

    // 🖼️ Yeni görsel yüklendiyse algıla
    const file = (req as any).file;
    if (file) {
      updateData.imageUrl = file.path;
    }
    
    // Servis katmanında bu veriyi güncelliyoruz
    const updatedProduct = await productService.updateProduct(id, updateData);
    
    if (!updatedProduct) {
      res.status(404).json({ message: "Güncellenecek ürün bulunamadı" });
      return;
    }
    
    res.status(200).json({ message: "Ürün başarıyla güncellendi", product: updatedProduct });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Ürün güncellenirken hata oluştu" });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    // Servis katmanından ürünü siliyoruz
    const deletedProduct = await productService.deleteProduct(id);
    
    if (!deletedProduct) {
      res.status(404).json({ message: "Silinecek ürün bulunamadı" });
      return;
    }
    
    res.status(200).json({ message: "Ürün başarıyla silindi" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Ürün silinirken hata oluştu" });
  }
};