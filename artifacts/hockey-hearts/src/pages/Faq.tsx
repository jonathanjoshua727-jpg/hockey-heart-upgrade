import { Shell } from "@/components/layout/Shell";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";

const faqs = [
  {
    category: "About Us",
    items: [
      {
        q: "What is Hockey Heart Initiative?",
        a: "Hockey Heart Initiative is a 501(c)(3) nonprofit organization dedicated to removing financial barriers that prevent youth from participating in hockey. We fund equipment, ice time, coaching, and community programs for children in underserved communities.",
      },
      {
        q: "Who does Hockey Heart Initiative serve?",
        a: "We serve youth ages 5–18 from families facing financial hardship who want to participate in hockey but cannot afford equipment, league fees, or ice time. We partner with rinks, schools, and community organizations in 14+ states.",
      },
      {
        q: "Is Hockey Heart Initiative a registered nonprofit?",
        a: "Yes. Hockey Heart Initiative is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the extent permitted by law. You will receive a donation acknowledgment letter for your records.",
      },
      {
        q: "Who is Andrei Svechnikov?",
        a: "Andrei Svechnikov is an NHL All-Star forward for the Carolina Hurricanes and the Lead Ambassador of Hockey Heart Initiative. He has pledged a personal $200,000 donation to our Equipment & Gear fund and actively participates in our programs and outreach events.",
      },
    ],
  },
  {
    category: "Donations",
    items: [
      {
        q: "What is the minimum donation?",
        a: "Our suggested minimum donation is $50, which covers the cost of a child's league registration fee for one season. However, no gift is too small — every dollar goes directly toward our programs.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept Bank Transfer, Credit/Debit Card, and Cryptocurrency (Bitcoin, Ethereum, USDT TRC20, USDT ERC20, and Solana). Payment processing is currently being configured. Please contact us at contacthockeyheartinitiative@gmail.com to complete your donation.",
      },
      {
        q: "Can I designate my donation to a specific cause?",
        a: "Yes. When donating, you can designate your gift to: General Fund, Youth Hockey Development, Community Hockey Programs, Equipment & Gear, Ice Time & Training Support, or Community Outreach.",
      },
      {
        q: "Are donations tax-deductible?",
        a: "Yes. As a 501(c)(3) organization, all donations to Hockey Heart Initiative are tax-deductible. You will receive a written acknowledgment of your contribution for tax purposes.",
      },
      {
        q: "Can I set up a recurring donation?",
        a: "Recurring donation options are currently being configured. Please contact us at contacthockeyheartinitiative@gmail.com and we will set up a recurring arrangement manually.",
      },
    ],
  },
  {
    category: "Programs",
    items: [
      {
        q: "How does a child apply for equipment assistance?",
        a: "Applications are accepted through partner rinks and community centers in our network. Contact us at contacthockeyheartinitiative@gmail.com with the child's name, age, location, and the specific need. We will connect you with the appropriate program.",
      },
      {
        q: "Does HHI operate its own rinks or leagues?",
        a: "No. We partner with existing rinks, leagues, and community organizations to fund access rather than build new infrastructure. This allows us to serve more youth more quickly and build on trusted local relationships.",
      },
      {
        q: "Can adults volunteer with Hockey Heart Initiative?",
        a: "Absolutely. We welcome volunteers for equipment distributions, youth clinics, fundraising events, and administrative support. Contact us to learn about current opportunities in your area.",
      },
    ],
  },
  {
    category: "Campaigns & Fundraising",
    items: [
      {
        q: "Can my organization create a fundraiser for HHI?",
        a: "Yes! Corporate and community fundraisers are welcome. Contact us at contacthockeyheartinitiative@gmail.com to discuss your idea and we will provide all necessary materials and guidance.",
      },
      {
        q: "How are campaign funds tracked?",
        a: "Campaign-specific donations are tracked separately and applied only to the designated campaign. We publish impact reports showing exactly how campaign funds were spent.",
      },
    ],
  },
];

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
          {faqs.map(({ category, items }) => (
            <div key={category} className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-primary border-b border-border pb-3">
                {category}
              </h2>
              <div className="space-y-3">
                {items.map(({ q, a }) => (
                  <FaqItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          ))}

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
