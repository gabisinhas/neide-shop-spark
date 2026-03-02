import { Truck, Package, CreditCard, ShieldCheck } from "lucide-react";

const benefits = [
  { icon: Truck, title: "ENTREGA MOTOBOY", desc: "consulte sua região" },
  { icon: Package, title: "FRETE GRÁTIS", desc: "acima de R$200*" },
  { icon: CreditCard, title: "PAGAMENTO FACILITADO", desc: "em até 6x sem juros*" },
  { icon: ShieldCheck, title: "LOJA 100% SEGURA", desc: "ambiente verificado" },
];

const BenefitsBar = () => {
  return (
    <section className="bg-card border-y border-border py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <b.icon className="text-primary" size={22} />
              </div>
              <div>
                <p className="font-bold text-xs md:text-sm text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsBar;
