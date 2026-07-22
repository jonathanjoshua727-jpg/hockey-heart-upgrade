import { Shell } from "@/components/layout/Shell";
import { CampaignCard } from "@/components/CampaignCard";
import camp1Image from "@assets/campaign-1.jpg";
import camp2Image from "@assets/campaign-2.jpg";
import camp3Image from "@assets/campaign-3.jpg";
import news1Image from "@assets/news-1.jpg"; // reuse as placeholder
import news2Image from "@assets/news-2.jpg"; // reuse as placeholder
import teamImage from "@assets/about-team.jpg"; // reuse as placeholder

export default function Campaigns() {
  const campaigns = [
    {
      id: "equip-2024",
      title: "Gear Up for Winter",
      description: "Providing full sets of high-quality hockey equipment to 500 underserved children across the state before the winter season begins. A single set of gear costs upwards of $500, making this a critical need.",
      category: "Hockey" as const,
      goal: 50000,
      raised: 32450,
      deadline: "Oct 31, 2024",
      image: camp3Image
    },
    {
      id: "health-screen",
      title: "Mobile Health Screenings",
      description: "Funding our mobile pediatric clinic to visit 20 rural communities, providing essential health screenings, immunizations, and basic dental checks to children without consistent care access.",
      category: "Health" as const,
      goal: 75000,
      raised: 61200,
      deadline: "Dec 15, 2024",
      image: camp2Image
    },
    {
      id: "ice-time",
      title: "Ice Time Access Fund",
      description: "Securing 1,000 hours of premium ice time for local youth leagues that have lost their municipal funding. Ice time is the single largest expense for any hockey program.",
      category: "Hockey" as const,
      goal: 25000,
      raised: 8900,
      deadline: "Nov 30, 2024",
      image: camp1Image
    },
    {
      id: "playroom-reno",
      title: "Oncology Playroom Renovation",
      description: "Completely renovating the pediatric oncology playroom at St. Jude's Regional with state-of-the-art interactive tech, comfortable seating for families, and stringent sanitization protocols.",
      category: "Health" as const,
      goal: 120000,
      raised: 105000,
      deadline: "Jan 1, 2025",
      image: news2Image
    },
    {
      id: "coaching-cert",
      title: "Coaches Certification Grants",
      description: "Funding USA Hockey certification and background checks for 50 volunteer coaches in low-income zip codes, ensuring kids have trained, safe mentors on the bench.",
      category: "Hockey" as const,
      goal: 15000,
      raised: 2500,
      deadline: "Sep 30, 2024",
      image: teamImage
    },
    {
      id: "nutrition-camp",
      title: "Summer Nutrition & Skills Camp",
      description: "A two-week intensive day camp combining on-ice skill development with hands-on nutritional education and healthy meals provided daily for 100 participants.",
      category: "Health" as const,
      goal: 40000,
      raised: 18000,
      deadline: "May 1, 2025",
      image: news1Image
    }
  ];

  return (
    <Shell>
      <section className="bg-primary py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Current Campaigns</h1>
          <p className="text-xl text-primary-foreground/80">
            Choose a cause that speaks to you. Every dollar goes directly toward programs that change children's lives.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <p className="text-muted-foreground font-medium">Showing {campaigns.length} active campaigns</p>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold cursor-pointer">All</span>
              <span className="px-4 py-2 bg-muted text-muted-foreground hover:bg-primary/10 rounded-full text-sm font-semibold cursor-pointer transition-colors">Hockey</span>
              <span className="px-4 py-2 bg-muted text-muted-foreground hover:bg-primary/10 rounded-full text-sm font-semibold cursor-pointer transition-colors">Health</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map(camp => (
              <CampaignCard key={camp.id} {...camp} />
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
