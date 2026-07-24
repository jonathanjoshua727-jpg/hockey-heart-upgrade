import { Shell } from "@/components/layout/Shell";
import { useParams, Link } from "wouter";
import { getCampaignBySlug, getActiveCampaigns } from "@/lib/contentStore";
import { ArrowLeft, Calendar, Target } from "lucide-react";
import NotFound from "@/pages/not-found";

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div className="space-y-2">
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full bg-secondary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-sm font-medium">
        <span className="text-primary">${raised.toLocaleString()} raised</span>
        <span className="text-muted-foreground">{pct}% of ${goal.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function CampaignDetail() {
  const params = useParams<{ slug: string }>();
  const campaign = getCampaignBySlug(params.slug);

  if (!campaign || !campaign.active) {
    return <NotFound />;
  }

  const deadlineFormatted = new Date(campaign.deadline).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const related = getActiveCampaigns()
    .filter((c) => c.id !== campaign.id)
    .slice(0, 3);

  return (
    <Shell>
      {/* Back */}
      <div className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full mb-6 inline-block">
            {campaign.category}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-4">
            {campaign.title}
          </h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">
            {campaign.description}
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Content */}
            <div className="lg:col-span-2 space-y-8">
              {campaign.content ? (
                <div
                  className="prose prose-slate max-w-none text-foreground [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-primary [&>ul]:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: campaign.content }}
                />
              ) : (
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {campaign.description}
                </p>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Goal", value: `$${campaign.goal.toLocaleString()}` },
                  { label: "Raised", value: `$${campaign.raised.toLocaleString()}` },
                  { label: "Days Left", value: daysLeft > 0 ? `${daysLeft}` : "Ended" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary font-serif">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <ProgressBar raised={campaign.raised} goal={campaign.goal} />
            </div>

            {/* Donate sidebar */}
            <aside className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
                <h3 className="font-serif text-xl font-bold text-primary">
                  Support This Campaign
                </h3>

                <ProgressBar raised={campaign.raised} goal={campaign.goal} />

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span>Deadline: {deadlineFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary shrink-0" />
                    <span>Category: {campaign.category}</span>
                  </div>
                </div>

                <Link
                  href={`/donate?campaign=${campaign.id}`}
                  className="block w-full text-center bg-secondary text-secondary-foreground py-4 rounded-xl font-semibold text-lg hover:bg-secondary/90 transition-colors"
                >
                  Donate to This Campaign
                </Link>

                <p className="text-xs text-muted-foreground text-center">
                  Hockey Heart Initiative is a 501(c)(3) nonprofit. All donations are tax-deductible.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-serif text-2xl font-bold text-primary mb-8">
              Other Active Campaigns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((c) => (
                <Link key={c.id} href={`/campaigns/${c.slug}`} className="group block">
                  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors space-y-4 h-full">
                    <span className="text-xs text-secondary font-semibold">{c.category}</span>
                    <h3 className="font-serif text-lg font-bold text-primary group-hover:text-primary/80 transition-colors">
                      {c.title}
                    </h3>
                    <ProgressBar raised={c.raised} goal={c.goal} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Shell>
  );
}
