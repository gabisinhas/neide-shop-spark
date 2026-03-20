import { useState } from 'react';
import { Product } from '../../domain/entities/Product';

export function useProductForm(initial?: Product) {
  const [form, setForm] = useState<Product>(
    initial || { id: '', name: '', price: 0, image: '', category: '' }
  );

  const handleChange = (field: keyof Product, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const reset = () => setForm(initial || { id: '', name: '', price: 0, image: '', category: '' });

  return { form, handleChange, reset };
}