import React from 'react';
import { ProductProvider, useProduct } from '../../contexts/ProductContext';
import { ProductForm } from '../../presentation/components/admin/ProductForm';
import { ProductCard } from '../../presentation/components/admin/ProductCard';

const AdminPage: React.FC = () => {
  const { products } = useProduct();

  return (
    <div>
      <h1>Administração de Produtos</h1>
      <ProductForm />
      <div>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default function Admin() {
  return (
    <ProductProvider>
      <AdminPage />
    </ProductProvider>
  );
}