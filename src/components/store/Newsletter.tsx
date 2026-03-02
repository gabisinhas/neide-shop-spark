import { useState } from "react";
import { motion } from "framer-motion";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend
    setEmail("");
  };

  return (
    <section className="bg-gradient-warm py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Cadastre-se em nossa Newsletter
          </h2>
          <p className="text-muted-foreground mb-6">
            Receba nossas novidades em seu e-mail!
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              required
              className="flex-1 px-4 py-3 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              className="bg-gradient-gold text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm hover:shadow-gold transition-shadow"
            >
              Cadastrar
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
