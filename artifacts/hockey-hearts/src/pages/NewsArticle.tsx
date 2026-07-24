import { Shell } from "@/components/layout/Shell";
import { useParams, Link } from "wouter";
import { getArticleBySlug, getPublishedArticles } from "@/lib/contentStore";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import NotFound from "@/pages/not-found";

export default function NewsArticle() {
  const params = useParams<{ slug: string }>();
  const article = getArticleBySlug(params.slug);

  if (!article || !article.published) {
    return <NotFound />;
  }

  const related = getPublishedArticles()
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  const formattedDate = new Date(article.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Shell>
      {/* Back */}
      <div className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News & Updates
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              {article.category}
            </span>
            {article.pinned && (
              <span className="border border-primary-foreground/30 text-primary-foreground/70 text-xs font-semibold px-3 py-1 rounded-full">
                Pinned
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-primary-foreground/70 text-sm">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Article body */}
            <div className="lg:col-span-3">
              <div
                className="prose prose-slate max-w-none text-foreground leading-relaxed space-y-4 [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-primary [&>ul]:text-muted-foreground [&>ul]:space-y-2 [&>strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border flex flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-12 bg-primary rounded-2xl p-8 text-center text-primary-foreground space-y-4">
                <h3 className="font-serif text-2xl font-bold">
                  Support our mission
                </h3>
                <p className="text-primary-foreground/80">
                  Every dollar helps put a child on the ice.
                </p>
                <Link
                  href="/donate"
                  className="inline-block bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-semibold hover:bg-secondary/90 transition-colors"
                >
                  Donate Now
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-8">
              <div className="bg-muted/40 border border-border rounded-2xl p-6 space-y-4">
                <h4 className="font-serif text-lg font-bold text-primary">
                  Quick Actions
                </h4>
                <div className="space-y-3">
                  <Link
                    href="/donate"
                    className="block w-full text-center bg-secondary text-secondary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary/90 transition-colors"
                  >
                    Donate Now
                  </Link>
                  <Link
                    href="/campaigns"
                    className="block w-full text-center border border-primary text-primary py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/5 transition-colors"
                  >
                    View Campaigns
                  </Link>
                  <Link
                    href="/contact"
                    className="block w-full text-center border border-border text-muted-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-muted/40 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              {related.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-serif text-lg font-bold text-primary">
                    Related Articles
                  </h4>
                  <div className="space-y-4">
                    {related.map((r) => (
                      <Link
                        key={r.id}
                        href={`/news/${r.slug}`}
                        className="block group"
                      >
                        <div className="border border-border rounded-xl p-4 hover:border-primary/40 transition-colors space-y-2">
                          <span className="text-xs text-secondary font-semibold">
                            {r.category}
                          </span>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                            {r.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </Shell>
  );
}
