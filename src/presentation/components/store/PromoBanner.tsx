import roupas from "@/assets/roupas.png";

const PromoBanner = () => {
  return (
    <section id="praia" className="py-8">
      <div className="container mx-auto px-4">
        <a href="#praia" className="block rounded-xl overflow-hidden shadow-card hover:shadow-gold transition-shadow">
          <img
            src={roupas}
            alt="Coleção Moda Praia"
            className="w-full h-48 md:h-72 object-cover"
            loading="lazy"
          />
        </a>
      </div>
    </section>
  );
};

export default PromoBanner;
