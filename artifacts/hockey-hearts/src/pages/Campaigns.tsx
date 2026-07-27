import { Shell } from "@/components/layout/Shell";
import { CampaignCard } from "@/components/CampaignCard";
import { useState } from "react";
import { getActiveCampaigns } from "@/lib/contentStore";
import { resolveImage, camp1 } from "@/lib/imageRegistry";

export default function Campaigns() {
  const allCampaigns = getActiveCampaigns();
  const categories = ["All", ...Array.from(new Set(allCampaigns.map((c) => c.category)))];
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? allCampaigns
      : allCampaigns.filter((c) => c.category === activeCategory);

  return (
    <Shell>
      <section className="bg-primary py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Current Campaigns</h1>
          <p className="text-xl text-primary-foreground/80">
            Choose a cause that speaks to you. Every dollar goes directly toward programs that
            change children's lives.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <p className="text-muted-foreground font-medium">
              Showing {filtered.length} active campaign{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No active campaigns at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((camp) => (
                <CampaignCard
                  key={camp.id}
                  id={camp.id}
                  slug={camp.slug}
                  title={camp.title}
                  description={camp.description}
                  category={camp.category}
                  goal={camp.goal}
                  raised={camp.raised}
                  deadline={new Date(camp.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  image={resolveImage(camp.imageUrl, camp1)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
