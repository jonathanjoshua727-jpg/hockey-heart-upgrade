import { Shell } from "@/components/layout/Shell";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { getPublishedFaqs } from "@/lib/contentStore";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-foreground pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 shrink-0 text-primary" />
        ) : (
          <ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  const faqs = getPublishedFaqs();
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <Shell>
      <section className="bg-primary py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-primary-foreground/80">
            Everything you need to know about Hockey Heart Initiative, donations, and our programs.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-14">
          {categories.map((category) => {
            const items = faqs.filter((f) => f.category === category);
            return (
              <div key={category} className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-primary border-b border-border pb-3">
                  {category}
                </h2>
                <div className="space-y-3">
                  {items.map((faq) => (
                    <FaqItem key={faq.id} q={faq.question} a={faq.answer} />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="bg-muted/40 border border-border rounded-2xl p-8 text-center space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary">Still have questions?</h3>
            <p className="text-muted-foreground">
              We're happy to help. Reach out and we'll respond within 2 business days.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
