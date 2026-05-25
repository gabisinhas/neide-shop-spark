import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../../domain/entities/Product';
import { appDependencies, type ProductDependencies } from '../../infrastructure/composition/appDependencies';

interface ProductContextProps {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextProps | undefined>(undefined);

interface ProductProviderProps {
  children: React.ReactNode;
  dependencies?: ProductDependencies;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({
  children,
  dependencies = appDependencies.product,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const data = await dependencies.getAllProducts.execute();
    setProducts([...data]);
  };

  useEffect(() => {
    void fetchProducts();
  }, [dependencies]);

  const addProduct = async (product: Product) => {
    await dependencies.createProduct.execute(product);
    await fetchProducts();
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    await dependencies.updateProduct.execute(id, updated);
    await fetchProducts();
  };

  const removeProduct = async (id: string) => {
    await dependencies.deleteProduct.execute(id);
    await fetchProducts();
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
