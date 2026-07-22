import { Shell } from "@/components/layout/Shell";
import { ImpactStat } from "@/components/ImpactStat";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import heroImage from "@assets/hero-hockey.jpg";

export default function Impact() {
  const stories = [
    {
      quote: "Before the grant, we thought Marcus would have to quit. The gear is just too expensive. Now, he's the captain of his bantam team and his grades have improved drastically because he wants to stay on the ice.",
      author: "Sarah J., Mother of a grant recipient"
    },
    {
      quote: "The mobile clinic found an irregular heart murmur during a routine pre-season screening. Because they caught it early, we were able to treat it before it became a crisis. They literally saved my son's life.",
      author: "David L., Parent"
    }
  ];

  return (
    <Shell>
      <section className="bg-primary py-20 md:py-32 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">Our Impact</h1>
          <p className="text-xl text-primary-foreground/80 font-serif italic mb-10">
            Numbers tell a story, but the real impact is measured in smiles, healthy checkups, and goals scored.
          </p>
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold rounded-full px-8">
            <Download className="mr-2 h-5 w-5" /> Download 2025 Annual Report
          </Button>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-primary rounded-3xl overflow-hidden shadow-2xl">
            <ImpactStat number="15,240" label="Children Reached" />
            <div className="hidden md:block w-px h-full bg-primary-foreground/10" />
            <ImpactStat number="$2.4M" label="Grants Awarded" />
            <div className="hidden lg:block w-px h-full bg-primary-foreground/10" />
            <ImpactStat number="8,500" label="Equipment Sets" />
            <div className="hidden md:block w-px h-full bg-primary-foreground/10" />
            <ImpactStat number="120" label="Health Programs" />
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-16">Stories from the Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {stories.map((story, idx) => (
              <div key={idx} className="bg-card p-10 rounded-3xl shadow-sm relative">
                <div className="absolute -top-6 left-10 text-6xl text-secondary/40 font-serif leading-none">"</div>
                <p className="text-lg text-foreground italic mb-6 relative z-10">
                  {story.quote}
                </p>
                <div className="text-primary font-bold">{story.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After / The Difference */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <img src={heroImage} alt="Impact" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary/20" />
            </div>
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary">The Difference We Make</h2>
              <div className="space-y-6">
                <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                  <h3 className="font-bold text-primary mb-2 text-xl">Before</h3>
                  <p className="text-muted-foreground">Families struggling to balance household necessities with expensive league fees, resulting in kids staying home.</p>
                </div>
                <div className="p-6 bg-secondary/10 rounded-2xl border border-secondary/20">
                  <h3 className="font-bold text-secondary-foreground mb-2 text-xl">After</h3>
                  <p className="text-foreground">Fully equipped players arriving at the rink ready to learn, backed by a community that supports their physical and mental health.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
