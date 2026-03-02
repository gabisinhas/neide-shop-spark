import product1 from "@/assets/product-1.png";
import product2 from "@/assets/product-2.png";
import product3 from "@/assets/product-3.png";
import product4 from "@/assets/product-4.png";
import product5 from "@/assets/product-5.png";
import product6 from "@/assets/product-6.png";
import product7 from "@/assets/product-7.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tag?: "lancamento" | "destaque" | "oferta";
  installments?: { count: number; value: number };
}

export const products: Product[] = [
  {
    id: "1",
    name: "CROPPED JULY",
    price: 59.99,
    image: product1,
    category: "Cropped",
    tag: "lancamento",
    installments: { count: 2, value: 30.0 },
  },
  {
    id: "2",
    name: "VESTIDO FLORA",
    price: 79.99,
    image: product2,
    category: "Vestido",
    tag: "lancamento",
    installments: { count: 2, value: 40.0 },
  },
  {
    id: "3",
    name: "SHORT LARA",
    price: 89.99,
    image: product3,
    category: "Short",
    tag: "lancamento",
    installments: { count: 2, value: 45.0 },
  },
  {
    id: "4",
    name: "BLUSA CARMEN",
    price: 49.99,
    image: product4,
    category: "Blusa",
    tag: "lancamento",
  },
  {
    id: "5",
    name: "SAIA LOLLA",
    price: 89.99,
    image: product5,
    category: "Saia",
    tag: "destaque",
    installments: { count: 2, value: 45.0 },
  },
  {
    id: "6",
    name: "BODY TROPICAL",
    price: 39.99,
    originalPrice: 49.99,
    image: product6,
    category: "Body",
    tag: "oferta",
  },
  {
    id: "7",
    name: "MACAQUINHO EVA",
    price: 69.99,
    image: product7,
    category: "Macaquinho",
    tag: "destaque",
    installments: { count: 2, value: 35.0 },
  },
];
