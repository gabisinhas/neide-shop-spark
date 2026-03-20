import { Instagram,  Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {

  const insta = "https://www.instagram.com/ns.closetb?igsh=MWViMGNqdmN5cGVhbA%3D%3D";
  return (
    <footer className="bg-warm-brown text-cream py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold text-gold-light mb-4">
              NS Closet
            </h3>
            <p className="text-sm text-cream/70 leading-relaxed">
              Moda feminina com estilo e qualidade. Looks incríveis para todas
              as ocasiões.
            </p>
            <div className="flex gap-4 mt-4">
              <a href={insta} className="text-cream/70 hover:text-gold-light transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm text-gold-light mb-4 uppercase tracking-wider">
              Institucional
            </h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-gold-light transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-gold-light transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-gold-light transition-colors">Trocas e Devoluções</a></li>
              <li><a href="#" className="hover:text-gold-light transition-colors">Termos de Uso</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm text-gold-light mb-4 uppercase tracking-wider">
              Contato
            </h4>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gold-light" />
                contato@vvvv.com.br
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold-light" />
                (19) 98275-9893
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-gold-light mt-0.5" />
                Sumaré, SP
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/10 mt-8 pt-8 text-center text-xs text-cream/40">
          © 2026 NS Closet — Todos os direitos reservados
        </div>
      </div>
    </footer>
  );
};

export default Footer;
