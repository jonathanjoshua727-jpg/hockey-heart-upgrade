import { Shell } from "@/components/layout/Shell";
import { NewsCard } from "@/components/NewsCard";
import { useState } from "react";
import { getPublishedArticles } from "@/lib/contentStore";
import { resolveImage, news1 } from "@/lib/imageRegistry";

export default function News() {
  const allArticles = getPublishedArticles();
  const categories = ["All", ...Array.from(new Set(allArticles.map((a) => a.category)))];
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? allArticles
      : allArticles.filter((a) => a.category === activeCategory);

  return (
    <Shell>
      <section className="bg-primary py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">News & Updates</h1>
          <p className="text-xl text-primary-foreground/80">
            Read the latest stories of impact, program updates, and announcements from the Hockey
            Heart Initiative.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Category filter */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-2 mb-10 justify-center">
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
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((article) => (
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
