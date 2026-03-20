import React from 'react';
import { useProductForm } from '../../../application/hooks/useProductForm';
import { useProduct } from '../../../contexts/ProductContext';
import { Product } from '../../../domain/entities/Product';

export const ProductForm: React.FC = () => {
  const { form, handleChange, reset } = useProductForm();
  const { addProduct } = useProduct();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({ ...form, id: Date.now().toString() });
    reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nome" />
      <input value={form.price} onChange={e => handleChange('price', Number(e.target.value))} placeholder="Preço" type="number" />
      <input value={form.image} onChange={e => handleChange('image', e.target.value)} placeholder="Imagem" />
      <input value={form.category} onChange={e => handleChange('category', e.target.value)} placeholder="Categoria" />
      <button type="submit">Adicionar Produto</button>
    </form>
  );
};