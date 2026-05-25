import { useState } from 'react';
import { Product } from '../../domain/entities/Product';

const INITIAL_PRODUCT_FORM: Product = {
  id: '',
  name: '',
  description: '',
  sku: '',
  category: '',
  image: '',
  price: 0,
  salePrice: 0,
  stockQuantity: 0,
  weight: 0,
  height: 0,
  width: 0,
  length: 0,
  variants: [],
};

export function useProductForm(initial?: Product) {
  const [form, setForm] = useState<Product>(
    initial || INITIAL_PRODUCT_FORM
  );

  const handleChange = <K extends keyof Product>(field: K, value: Product[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const reset = () => setForm(initial || INITIAL_PRODUCT_FORM);

  return { form, handleChange, reset };
}
