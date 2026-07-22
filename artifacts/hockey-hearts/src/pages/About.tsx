import { Shell } from "@/components/layout/Shell";
import teamImage from "@assets/about-team.jpg";
import { Award, Heart, Shield, Users } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Compassion First",
      description: "We lead with empathy, recognizing that true impact begins with understanding the specific needs of the children and families we serve."
    },
    {
      icon: Shield,
      title: "Unwavering Integrity",
      description: "Transparency in our funding and honesty in our partnerships are the bedrock of our relationships with donors and communities."
    },
    {
      icon: Users,
      title: "Community Power",
      description: "We believe that it takes a team to raise a child. We actively foster collaboration between healthcare providers, sports leagues, and local leaders."
    },
    {
      icon: Award,
      title: "Excellence & Discipline",
      description: "Drawing from the core tenets of hockey, we demand dedication, hard work, and resilience in everything we do as an organization."
    }
  ];

  const milestones = [
    { year: "2010", text: "Founded by a coalition of former pro players and pediatricians." },
    { year: "2014", text: "Reached $1 Million in cumulative equipment grants." },
    { year: "2018", text: "Launched the first Mobile Pediatric Clinic initiative." },
    { year: "2023", text: "Expanded operations nationwide, supporting over 15,000 children annually." }
  ];

  return (
    <Shell>
      {/* Header */}
      <section className="bg-primary py-20 md:py-32 text-center text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">Our Story</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed font-serif italic">
            "A decade of bridging the gap between the rink and the recovery room."
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">Born from a simple observation.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In 2010, a group of pediatricians and former professional hockey players noticed a stark reality: the children who needed the discipline, community, and joy of team sports the most were often the ones who lacked the health foundation or financial means to participate.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hockey Hearts Initiative was created to address both sides of this equation. We don't just hand out skates; we ensure kids are healthy enough to wear them. We don't just fund hospital playrooms; we give patients a goal to strive for once they recover.
              </p>
            </div>
            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <img src={teamImage} alt="Our Team" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-6">Our Guiding Principles</h2>
            <p className="text-lg text-muted-foreground">These values dictate every grant we approve, every program we fund, and every partnership we build.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-card p-8 rounded-3xl border border-card-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <v.icon className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-primary mb-4">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-16 text-center">Milestones of Impact</h2>
          <div className="space-y-12">
            {milestones.map((m, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
                <div className="md:w-1/3 text-left md:text-right">
                  <span className="font-serif text-4xl md:text-5xl font-bold text-secondary">{m.year}</span>
                </div>
                <div className="hidden md:flex w-4 h-4 bg-primary rounded-full relative z-10 shrink-0 ring-8 ring-background" />
                <div className="md:w-2/3">
                  <p className="text-xl text-foreground font-medium">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
