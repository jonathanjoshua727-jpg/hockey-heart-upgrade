import { Shell } from "@/components/layout/Shell";
import { DonationForm } from "@/components/DonationForm";

export default function Donate() {
  return (
    <Shell>
      <section className="min-h-[90vh] bg-muted/30 py-20 flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Content */}
            <div className="space-y-8 max-w-xl">
              <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-semibold rounded-full text-sm uppercase tracking-wider">
                Make an Impact
              </div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary leading-tight">
                Your generosity puts them on the ice.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Whether you're funding a child's first pair of skates or contributing to our mobile health clinic, your donation is an investment in the next generation.
              </p>
              
              <div className="pt-8 border-t border-border">
                <h3 className="font-serif text-2xl font-bold text-primary mb-6">What your gift provides:</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      $50
                    </div>
                    <span className="text-foreground font-medium">Covers a child's league registration fee</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      $150
                    </div>
                    <span className="text-foreground font-medium">Funds a comprehensive pediatric health screening</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      $500
                    </div>
                    <span className="text-foreground font-medium">Equips a player with full, safe hockey gear</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Form */}
            <div className="relative">
              {/* Decorative blob behind form */}
              <div className="absolute -top-10 right-0 lg:-right-10 w-64 h-64 bg-secondary/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 left-0 lg:-left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <DonationForm />
              </div>
            </div>

          </div>
        </div>
      </section>
    </Shell>
  );
}
