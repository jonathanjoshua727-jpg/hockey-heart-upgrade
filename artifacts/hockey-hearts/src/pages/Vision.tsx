import { Shell } from "@/components/layout/Shell";
import { Target, Heart, Globe, Star, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const pillars = [
  {
    icon: Target,
    title: "Measurable Impact",
    description:
      "Every dollar is tracked against a clear outcome: a child equipped, a practice session funded, a coach certified. We publish full financial transparency reports annually.",
  },
  {
    icon: Heart,
    title: "Whole-Child Focus",
    description:
      "Hockey is the vehicle — health, confidence, and belonging are the destination. We ensure every program addresses physical, emotional, and social development.",
  },
  {
    icon: Globe,
    title: "National Reach, Local Roots",
    description:
      "Our programs are built by the communities they serve. We partner with local rinks, schools, and families rather than imposing a one-size-fits-all solution.",
  },
  {
    icon: Star,
    title: "Excellence Without Exclusion",
    description:
      "We believe competitive-quality hockey should not be a privilege. Our youth deserve the same level of coaching, gear, and opportunity as players in any zip code.",
  },
];

const milestones = [
  { year: "2030", goal: "20,000 youth served annually across all 50 states" },
  { year: "2028", goal: "100 community rink partnerships with guaranteed free ice time" },
  { year: "2027", goal: "$5M equipment fund endowment established" },
  { year: "2026", goal: "Active programs in 25+ states — underway now" },
];

export default function Vision() {
  return (
    <Shell>
      {/* Hero */}
      <section className="bg-primary py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="uppercase tracking-widest text-secondary text-sm font-semibold mb-4">Our Vision</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
            A world where every child skates.
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Hockey Heart Initiative is building toward an America where no child is turned away from the ice
            because of income, geography, or access. This is our long-term vision — and the work we do every day.
          </p>
        </div>
      </section>

      {/* Statement */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">Vision Statement</h2>
            <blockquote className="text-xl md:text-2xl text-muted-foreground leading-relaxed italic border-l-4 border-secondary pl-8 text-left">
              "We envision a generation of young Americans for whom hockey is not an exclusive sport reserved for
              the privileged few — but a universal language of teamwork, discipline, health, and joy that every
              child speaks fluently, regardless of where they were born."
            </blockquote>
            <p className="text-muted-foreground">— Hockey Heart Initiative Founding Charter, 2021</p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
              The Pillars of Our Vision
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Four commitments that guide every decision, program, and investment we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-primary">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
              Our Roadmap to 2030
            </h2>
            <p className="text-muted-foreground text-lg">
              Ambitious, measurable goals with real accountability at every step.
            </p>
          </div>
          <div className="space-y-6">
            {milestones.map(({ year, goal }) => (
              <div key={year} className="flex gap-6 items-start">
                <div className="shrink-0 w-20 text-right">
                  <span className="font-serif text-2xl font-bold text-primary">{year}</span>
                </div>
                <div className="w-px bg-secondary/40 self-stretch relative">
                  <div className="absolute top-2 -left-2 w-4 h-4 rounded-full bg-secondary" />
                </div>
                <div className="pb-6">
                  <p className="text-foreground text-lg leading-relaxed">{goal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold">Help us get there.</h2>
          <p className="text-primary-foreground/80 text-lg">
            Every donation, volunteer hour, and shared post moves us closer to a world where every child skates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-secondary/90 transition-colors"
            >
              Donate Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-foreground/10 transition-colors"
            >
              View Campaigns
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
