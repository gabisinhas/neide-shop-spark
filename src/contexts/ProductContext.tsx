import React, { createContext, useContext, useState } from 'react';
import { Product } from '../domain/entities/Product';
import { ProductService } from '../infrastructure/services/ProductService';

const productService = new ProductService();

interface ProductContextProps {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(productService.getAll());

  const addProduct = (product: Product) => {
    productService.add(product);
    setProducts(productService.getAll());
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    productService.update(id, updated);
    setProducts(productService.getAll());
  };

  const removeProduct = (id: string) => {
    productService.remove(id);
    setProducts(productService.getAll());
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, removeProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProduct must be used within ProductProvider');
  return context;
};