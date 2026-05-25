import { Search, User, ShoppingBag, Menu, X, Settings, LogOut, Package } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/presentation/contexts/CartContext";
import { useAuth } from "@/presentation/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { APP_ROUTES } from "@/presentation/routes/paths";
import { isAdminRole } from "@/domain/entities/role";

const navLinks = [
  { label: "TODOS OS PRODUTOS", href: "#produtos" },
  { label: "LANÇAMENTOS", href: "#lancamentos" },
  { label: "ROUPAS", href: "#roupas" },
  { label: "COSMÉTICOS", href: "#cosmeticos" },
];

const Header = () => {
  const { totalItems, setIsOpen } = useCart();
  const { currentUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleAccountClick = () => {
    navigate(currentUser ? APP_ROUTES.profile : APP_ROUTES.auth);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground"
            aria-label="Menu"
            type="button"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

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

          <div className="flex-1 md:flex-none text-center">
            <Link to={APP_ROUTES.home}>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gradient-gold tracking-wide">NS Closet</h1>
            </Link>
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Roupas e Cosméticos para o seu dia a dia.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden text-foreground"
              aria-label="Buscar"
              type="button"
            >
              <Search size={20} />
            </button>

            <div className="hidden md:flex flex-col items-end gap-0.5">
              <button
                onClick={handleAccountClick}
                className="flex items-center gap-1 text-sm text-foreground hover:text-primary transition-colors"
                type="button"
              >
                <User size={18} />
                <span>{currentUser ? currentUser.name.split(' ')[0] : 'Conta'}</span>
              </button>

              <div className="flex items-center gap-3 text-xs">
                {currentUser ? (
                  <button
                    onClick={() => navigate(APP_ROUTES.profile)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    type="button"
                  >
                    <User size={13} />
                    <span>Perfil</span>
                  </button>
                ) : null}

                {currentUser ? (
                  <button
                    onClick={() => navigate(APP_ROUTES.orders)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    type="button"
                  >
                    <Package size={13} />
                    <span>Pedidos</span>
                  </button>
                ) : null}

                {isAdminRole(currentUser?.role) ? (
                  <button
                    onClick={() => navigate(APP_ROUTES.admin)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    type="button"
                  >
                    <Settings size={13} />
                    <span>Admin</span>
                  </button>
                ) : null}

                {currentUser ? (
                  <button
                    onClick={signOut}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    type="button"
                  >
                    <LogOut size={13} />
                    <span>Sair</span>
                  </button>
                ) : null}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="relative text-foreground hover:text-primary transition-colors"
              aria-label="Carrinho"
              type="button"
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

              <button
                onClick={() => {
                  handleAccountClick();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                type="button"
              >
                <User size={18} />
                <span>{currentUser ? 'Minha Conta' : 'Entrar'}</span>
              </button>

              {currentUser ? (
                <button
                  onClick={() => {
                    navigate(APP_ROUTES.profile);
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  type="button"
                >
                  <User size={18} />
                  <span>Meu perfil</span>
                </button>
              ) : null}

              {currentUser ? (
                <button
                  onClick={() => {
                    navigate(APP_ROUTES.orders);
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  type="button"
                >
                  <Package size={18} />
                  <span>Meus pedidos</span>
                </button>
              ) : null}

              {currentUser ? (
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  type="button"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              ) : null}

              {isAdminRole(currentUser?.role) ? (
                <button
                  onClick={() => {
                    navigate(APP_ROUTES.admin);
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  type="button"
                >
                  <Settings size={18} />
                  <span>Admin</span>
                </button>
              ) : null}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
