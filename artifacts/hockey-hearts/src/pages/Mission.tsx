import { Shell } from "@/components/layout/Shell";
import { Link } from "wouter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import missionHealth from "@assets/mission-health.jpg";
import missionHockey from "@assets/mission-hockey.jpg";

export default function Mission() {
  return (
    <Shell>
      {/* Header */}
      <section className="bg-primary py-20 md:py-32 text-center text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed font-serif italic max-w-2xl mx-auto">
            "To foster physical, mental, and emotional well-being in children through the intersection of sports and healthcare."
          </p>
        </div>
      </section>

      {/* The Two Pillars Intro */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-8 leading-tight">
            Two Causes. One Goal.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We operate at the unique intersection of youth sports and pediatric health. We believe that to truly empower a child, you must address both their physical well-being and their opportunities for personal growth. These are our two foundational pillars.
          </p>
        </div>
      </section>

      {/* Pillar 1: Youth Hockey */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-xl">
              <img src={missionHockey} alt="Youth Hockey" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-block px-4 py-1.5 bg-secondary/20 text-secondary-foreground font-semibold rounded-full text-sm uppercase tracking-wider mb-2">
                Pillar One
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">Youth Hockey Development</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hockey teaches resilience, teamwork, and discipline—skills that serve children long after they step off the ice. However, the high cost of equipment and ice time creates a massive barrier to entry for underserved communities.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <strong className="text-foreground block text-lg">Equipment Grants</strong>
                    <span className="text-muted-foreground">Providing full sets of safe, high-quality gear to children who otherwise couldn't afford to play.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <strong className="text-foreground block text-lg">Community Hockey Programs</strong>
                    <span className="text-muted-foreground">Funding structured youth leagues and coaching programs in underserved communities so families never have to choose between necessities and their child's passion.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <strong className="text-foreground block text-lg">Ice Time & Training Support</strong>
                    <span className="text-muted-foreground">Subsidizing rink costs and certified coaching for local leagues facing budget constraints or facility closures.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 2: Children's Health */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-secondary/20 text-secondary-foreground font-semibold rounded-full text-sm uppercase tracking-wider mb-2">
                Pillar Two
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">Children's Health Initiatives</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A child cannot thrive on the ice if they are not healthy off it. We partner with leading pediatric institutions and community clinics to ensure every child has access to comprehensive healthcare.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <strong className="text-foreground block text-lg">Mobile Screenings</strong>
                    <span className="text-muted-foreground">Bringing preventative care directly to underserved neighborhoods via our mobile clinic fleet.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <strong className="text-foreground block text-lg">Hospital Programs</strong>
                    <span className="text-muted-foreground">Funding playrooms, therapy resources, and comfort items for children undergoing long-term medical treatments.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div>
                    <strong className="text-foreground block text-lg">Nutritional Education</strong>
                    <span className="text-muted-foreground">Workshops that teach young athletes and their families the fundamentals of healthy eating and active living.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-xl">
              <img src={missionHealth} alt="Children's Health" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Ready to help us build a healthier future?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/donate"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 h-16 rounded-xl font-semibold"
              )}
            >
              Make a Donation
            </Link>
            <Link 
              href="/campaigns"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "bg-transparent text-white border-white hover:bg-white/10 text-lg px-8 h-16 rounded-xl font-semibold"
              )}
            >
              View Campaigns
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
