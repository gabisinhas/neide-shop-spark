import React from 'react';
import { Product } from '../../../domain/entities/Product';
import { useProduct } from '../../../contexts/ProductContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { removeProduct } = useProduct();

  return (
    <div>
      <img src={product.image} alt={product.name} width={100} />
      <h3>{product.name}</h3>
      <p>R${product.price}</p>
      <p>{product.category}</p>
      <button onClick={() => removeProduct(product.id)}>Remover</button>
    </div>
  );
};