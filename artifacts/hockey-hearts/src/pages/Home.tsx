import { Shell } from "@/components/layout/Shell";
import { HeroSection } from "@/components/HeroSection";
import { CampaignCard } from "@/components/CampaignCard";
import { ImpactStat } from "@/components/ImpactStat";
import { NewsCard } from "@/components/NewsCard";
import { Link } from "wouter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroImage from "@assets/hero-hockey.jpg";
import camp1Image from "@assets/campaign-1.jpg";
import camp2Image from "@assets/campaign-2.jpg";
import camp3Image from "@assets/campaign-3.jpg";
import news1Image from "@assets/news-1.jpg";
import news2Image from "@assets/news-2.jpg";

export default function Home() {
  const featuredCampaigns = [
    {
      id: "equip-2026",
      title: "Gear Up for Winter",
      description: "Providing full sets of high-quality hockey equipment to 500 underserved children across the state before the winter season begins.",
      category: "Hockey" as const,
      goal: 50000,
      raised: 32450,
      deadline: "Oct 31, 2026",
      image: camp3Image
    },
    {
      id: "health-screen",
      title: "Mobile Health Screenings",
      description: "Funding our mobile pediatric clinic to visit 20 rural communities, providing essential health screenings and immunizations.",
      category: "Health" as const,
      goal: 75000,
      raised: 61200,
      deadline: "Dec 15, 2026",
      image: camp2Image
    },
    {
      id: "ice-time",
      title: "Ice Time Access Fund",
      description: "Securing 1,000 hours of premium ice time for local youth leagues that have lost their funding due to budget cuts.",
      category: "Hockey" as const,
      goal: 25000,
      raised: 8900,
      deadline: "Nov 30, 2026",
      image: camp1Image
    }
  ];

  const recentNews = [
    {
      id: "street-hockey-success",
      title: "Summer Street Hockey Program Reaches New Heights",
      date: "July 10, 2026",
      category: "Program Update",
      excerpt: "Over 1,200 kids participated in our free summer street hockey camps, breaking previous attendance records and bringing communities together.",
      image: news1Image
    },
    {
      id: "hospital-partnership",
      title: "New Partnership with Children's Memorial",
      date: "June 25, 2026",
      category: "Health Initiative",
      excerpt: "We are thrilled to announce a $100,000 commitment to the new pediatric oncology playroom at Children's Memorial Hospital.",
      image: news2Image
    }
  ];

  return (
    <Shell>
      <HeroSection 
        image={heroImage}
        heading="Play. Heal. Thrive."
        subheading="Empowering youth through the discipline of hockey and championing their right to health and opportunity."
      />

      {/* Mission Teaser */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-8 leading-tight">
            We believe every child deserves a fair shot—on the ice and in life.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12">
            The Hockey Heart Initiative bridges the gap between athletic development and fundamental well-being. By funding youth hockey programs and supporting vital children's health initiatives, we are building a stronger, healthier future for our communities.
          </p>
          <Link 
            href="/mission"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-primary text-primary hover:bg-primary/5 rounded-full px-8 text-lg"
            )}
          >
            Explore Our Mission
          </Link>
        </div>
      </section>

      {/* Ambassadors */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-secondary font-semibold uppercase tracking-widest text-sm mb-3">Proud Supporters</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Our Player Ambassadors</h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              These professional players know the game changed their lives. Now they're making sure it can change yours.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Andrei Svechnikov", role: "Center / Lead Ambassador", number: "#37" },
              { name: "Marcus Kowalczyk", role: "Defenseman", number: "#4" },
              { name: "Tyler Oduya", role: "Right Wing", number: "#21" },
              { name: "Viktor Petrov", role: "Goaltender", number: "#31" },
            ].map((player) => (
              <div key={player.name} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/20 border-2 border-secondary/40 flex items-center justify-center group-hover:border-secondary transition-colors">
                  <span className="font-serif text-2xl font-bold text-secondary">{player.number}</span>
                </div>
                <p className="font-bold text-sm">{player.name}</p>
                <p className="text-primary-foreground/60 text-xs mt-1">{player.role}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-primary-foreground/50 text-sm italic">
            "Hockey gave us everything. This is how we give back." — Andrei Svechnikov
          </p>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">Urgent Campaigns</h2>
              <p className="text-muted-foreground text-lg">Your support directly impacts children's lives today. Discover where your help is needed most.</p>
            </div>
            <Link 
              href="/campaigns"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-primary hover:bg-primary/10 font-semibold group"
              )}
            >
              View All Campaigns <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map(camp => (
              <CampaignCard key={camp.id} {...camp} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">
            <ImpactStat number="15k+" label="Kids Reached" />
            <ImpactStat number="$2.4M" label="Funds Distributed" />
            <ImpactStat number="8,500" label="Equipment Sets" />
            <ImpactStat number="120" label="Health Programs Funded" />
          </div>
        </div>
      </section>

      {/* News Teaser */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">Latest Updates</h2>
              <p className="text-muted-foreground text-lg">Stories of resilience, community, and the impact we are making together.</p>
            </div>
            <Link 
              href="/news"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-primary hover:bg-primary/10 font-semibold group"
              )}
            >
              Read All News <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentNews.map(news => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </div>
      </section>

    </Shell>
  );
}
