import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.png";

const HeroBanner = () => {
  return (
    <section className="relative w-full overflow-hidden">
      <div>
        <img
          src={heroBanner}
          alt="Coleção 2026 - Praticidade para você!"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/40 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-16 lg:px-24"
        >
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
            <br />
            <span className="bg-gradient-to-r from-amber-900 to-stone-700 bg-clip-text text-transparent">
              Coleção 2026
            </span>
          </h2>
          <p className="mt-4 text-lg md:text-xl text-primary-foreground/90 max-w-md">
            Praticidade para você!
          </p>
          <a
            href="#lancamentos"
            className="mt-6 inline-block bg-gradient-gold text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm tracking-wide hover:shadow-gold transition-shadow"
          >
            VER COLEÇÃO
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
