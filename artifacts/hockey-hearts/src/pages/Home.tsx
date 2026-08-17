import { Shell } from "@/components/layout/Shell";
import { HeroSection } from "@/components/HeroSection";
import { CampaignCard } from "@/components/CampaignCard";
import { ImpactStat } from "@/components/ImpactStat";
import { NewsCard } from "@/components/NewsCard";
import { Link } from "wouter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getFeaturedCampaigns,
  getPublishedArticles,
  getHomepageContent,
  getSiteSettings,
  getActiveSupporters,
} from "@/lib/contentStore";
import { resolveImage, heroImg, camp1, news1 } from "@/lib/imageRegistry";
import { trackClick } from "@/lib/analytics";

import type { Supporter } from "@/lib/contentStore";

function SupporterAvatar({ player }: { player: Supporter }) {
  return (
    <>
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/20 border-2 border-secondary/40 flex items-center justify-center group-hover:border-secondary transition-colors overflow-hidden">
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className="font-serif text-2xl font-bold text-secondary">
            {player.number ?? player.name.charAt(0)}
          </span>
        )}
      </div>
      <p className="font-bold text-sm">{player.name}</p>
      <p className="text-primary-foreground/60 text-xs mt-1">{player.role}</p>
    </>
  );
}

export default function Home() {
  const homepageContent = getHomepageContent();
  const siteSettings = getSiteSettings();
  const supporters = getActiveSupporters();

  const allCampaigns = getFeaturedCampaigns();
  const featuredCampaigns = allCampaigns.slice(0, 3);

  const allArticles = getPublishedArticles();
  const recentNews = allArticles.slice(0, 2);

  return (
    <Shell>
      <HeroSection
        image={heroImg}
        heading={homepageContent.heroHeading}
        subheading={homepageContent.heroSubheading}
      />

      {/* Mission Teaser */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-8 leading-tight">
            {homepageContent.missionTitle}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12">
            {homepageContent.missionText}
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
            <p className="text-secondary font-semibold uppercase tracking-widest text-sm mb-3">
              Proud Supporters
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Our Player Ambassadors
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
              These professional players know the game changed their lives. Now they're making sure
              it can change yours.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {supporters.slice(0, 8).map((player) => (
              <div
                key={player.id}
                className="text-center group"
                onClick={() => player.link && trackClick(player.name, 'supporter', player.link, '/')}
              >
                {player.link ? (
                  <a href={player.link} target="_blank" rel="noopener noreferrer" className="block">
                    <SupporterAvatar player={player} />
                  </a>
                ) : (
                  <SupporterAvatar player={player} />
                )}
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
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
                Urgent Campaigns
              </h2>
              <p className="text-muted-foreground text-lg">
                Your support directly impacts children's lives today. Discover where your help is
                needed most.
              </p>
            </div>
            <Link
              href="/campaigns"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-primary hover:bg-primary/10 font-semibold group"
              )}
            >
              View All Campaigns{" "}
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {featuredCampaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No featured campaigns at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCampaigns.map((camp) => (
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

      {/* Impact Stats */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-primary-foreground/20">
            {siteSettings.impactStats.map(({ number, label }) => (
              <ImpactStat key={label} number={number} label={label} />
            ))}
          </div>
        </div>
      </section>

      {/* News Teaser */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
                Latest Updates
              </h2>
              <p className="text-muted-foreground text-lg">
                Stories of resilience, community, and the impact we are making together.
              </p>
            </div>
            <Link
              href="/news"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-primary hover:bg-primary/10 font-semibold group"
              )}
            >
              Read All News{" "}
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {recentNews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No news articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentNews.map((article) => (
                <NewsCard
                  key={article.id}
                  id={article.slug}
                  title={article.title}
                  date={new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  category={article.category}
                  excerpt={article.excerpt}
                  image={resolveImage(article.imageUrl, news1)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
