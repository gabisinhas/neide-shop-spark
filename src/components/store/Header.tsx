import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "TODOS OS PRODUTOS", href: "#produtos" },
  { label: "LANÇAMENTOS", href: "#lancamentos" },
  { label: "ROUPAS", href: "#roupas" },
  { label: "COSMÉTICOS", href: "#cosmeticos" },
];

const Header = () => {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Encontre seu look aqui"
                className="w-64 pl-4 pr-10 py-2 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
            </div>
          </div>

          {/* Logo */}
          <div className="flex-1 md:flex-none text-center">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gradient-gold tracking-wide">
              NS Closet
            </h1>
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Roupas e Cosméticos para o seu dia a dia.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden text-foreground"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
            <button className="hidden md:flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors">
              <User size={18} />
              <span>Conta</span>
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="relative text-foreground hover:text-primary transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center justify-center gap-8 pb-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Mobile search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Encontre seu look aqui"
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-card"
          >
            <nav className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <button className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <User size={18} />
                <span>Minha Conta</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
