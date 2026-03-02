import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
}

const tagStyles = {
  lancamento: "bg-primary text-primary-foreground",
  destaque: "bg-accent text-accent-foreground",
  oferta: "bg-destructive text-destructive-foreground",
};

const tagLabels = {
  lancamento: "Lançamento",
  destaque: "Destaque",
  oferta: "Oferta",
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-card rounded-lg overflow-hidden shadow-card hover:shadow-gold transition-shadow"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.tag && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${tagStyles[product.tag]}`}
          >
            {tagLabels[product.tag]}
          </span>
        )}
        {product.originalPrice && (
          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-bold">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-2">
          {product.name}
        </h3>
        <div className="mb-3">
          {product.originalPrice && (
            <p className="text-xs text-muted-foreground line-through">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </p>
          )}
          <p className="text-lg font-bold text-primary">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </p>
          {product.installments && (
            <p className="text-xs text-muted-foreground">
              ou <strong>{product.installments.count}x</strong> de{" "}
              <strong>
                R$ {product.installments.value.toFixed(2).replace(".", ",")}
              </strong>{" "}
              Sem juros
            </p>
          )}
        </div>
        <button
          onClick={() => addItem(product)}
          className="w-full bg-gradient-gold text-primary-foreground py-2.5 rounded-full text-sm font-semibold hover:shadow-gold transition-shadow"
        >
          Eu Quero!
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
