import AnnouncementBar from "@/components/store/AnnouncementBar";
import Header from "@/components/store/Header";
import HeroBanner from "@/components/store/HeroBanner";
import BenefitsBar from "@/components/store/BenefitsBar";
import ProductSection from "@/components/store/ProductSection";
import PromoBanner from "@/components/store/PromoBanner";
import Newsletter from "@/components/store/Newsletter";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import { products } from "@/data/products";

const Index = () => {
  const lancamentos = products.filter((p) => p.tag === "lancamento");
  const destaques = products.filter((p) => p.tag === "destaque");
  const ofertas = products.filter((p) => p.tag === "oferta");

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <HeroBanner />
      <BenefitsBar />

      <div id="lancamentos">
        <ProductSection title="Novidades da Semana" products={lancamentos} />
      </div>

      <PromoBanner />

      <div id="produtos">
        <ProductSection title="Os Looks Queridinhos" products={destaques} />
      </div>

      {ofertas.length > 0 && (
        <div className="bg-gradient-warm">
          <ProductSection title="Ofertas da Semana" products={ofertas} />
        </div>
      )}

      <Newsletter />
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
