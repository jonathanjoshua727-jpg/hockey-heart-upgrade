// CMS content store backed by localStorage
// Falls back to static seed data when no admin data exists

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  imageUrl?: string;
  scheduledAt?: string;
  pinned?: boolean;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  deadline: string;
  category: string;
  featured: boolean;
  active: boolean;
  imageUrl?: string;
  content?: string;
}

export interface PaymentSettings {
  paystackPublicKey: string;
  paystackSecretKey: string;
  paystackEnabled: boolean;
  cardEnabled: boolean;
  bankTransferEnabled: boolean;
  cryptoEnabled: boolean;
  cryptoWallets: {
    bitcoin: string;
    ethereum: string;
    usdtTrc20: string;
    usdtErc20: string;
    solana: string;
  };
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: string;
  status: "completed" | "pending" | "failed";
  donorEmail: string;
  cause: string;
  reference: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  section: string;
  detail: string;
}

// ── Keys ──────────────────────────────────────────────────────────────────
const KEYS = {
  articles: "hhi_articles",
  campaigns: "hhi_campaigns",
  payments: "hhi_payment_settings",
  transactions: "hhi_transactions",
  activityLog: "hhi_activity_log",
};

// ── Helpers ───────────────────────────────────────────────────────────────
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Seed data ─────────────────────────────────────────────────────────────
const SEED_ARTICLES: NewsArticle[] = [
  {
    id: "1",
    slug: "andrei-svechnikov-lead-ambassador",
    title: "Andrei Svechnikov Named Lead Ambassador of Hockey Heart Initiative",
    date: "2026-05-12",
    category: "Announcement",
    author: "HHI Communications Team",
    excerpt:
      "NHL All-Star Andrei Svechnikov has officially joined as our Lead Ambassador, pledging a personal $200,000 donation to the equipment grant fund.",
    content: `<p>Hockey Heart Initiative is thrilled to announce that Andrei Svechnikov, All-Star forward for the Carolina Hurricanes, has officially joined our organization as Lead Ambassador.</p>
<p>Svechnikov — whose meteoric NHL career has made him one of the most dynamic players in the league — grew up understanding firsthand how financial barriers can stand between a talented young player and the ice. Today, he channels that experience into direct action.</p>
<p>"Every kid who loves hockey deserves a shot," Svechnikov said at the announcement. "I was lucky. Not every kid is. That's why I'm here."</p>
<p>As part of his ambassadorial commitment, Svechnikov has pledged a personal donation of $200,000 to the Equipment & Gear fund and will participate in three seasons of active advocacy — including youth hockey clinics, hospital visits, and fundraising appearances.</p>
<p>We are honored to have Andrei as the face of our mission and look forward to the impact we will create together.</p>`,
    tags: ["Ambassador", "Announcement", "Andrei Svechnikov"],
    featured: true,
    published: true,
    pinned: true,
  },
  {
    id: "2",
    slug: "winter-equipment-drive-2026",
    title: "Winter Equipment Drive Surpasses $150,000 Goal",
    date: "2026-04-28",
    category: "Campaign Update",
    author: "HHI Campaign Team",
    excerpt:
      "Our Winter Equipment Drive has exceeded its fundraising goal, providing gear to over 340 youth players across eight states.",
    content: `<p>We are beyond proud to share that the Hockey Heart Initiative Winter Equipment Drive has surpassed its $150,000 fundraising goal — a milestone achieved through the generosity of donors from coast to coast.</p>
<p>The funds raised will provide skates, helmets, pads, and sticks to 340+ youth players in eight states who previously lacked access to proper protective gear.</p>
<p>Distribution is underway and will be completed before the start of the fall season. Each recipient family will receive a complete gear package fitted to their child's size and level of play.</p>
<p>Thank you to every donor, volunteer, and partner who made this possible. The ice is waiting.</p>`,
    tags: ["Equipment", "Campaign", "Milestone"],
    featured: false,
    published: true,
  },
  {
    id: "3",
    slug: "community-rink-partnership-detroit",
    title: "New Rink Partnership Brings Free Ice Time to Detroit Youth",
    date: "2026-04-10",
    category: "Programs",
    author: "HHI Programs Team",
    excerpt:
      "HHI has partnered with three Detroit-area rinks to offer 12 hours of subsidized weekly ice time to youth hockey leagues serving low-income families.",
    content: `<p>Hockey Heart Initiative has formalized partnerships with three Detroit-area ice rinks to provide 12 hours of subsidized weekly ice time exclusively for youth hockey leagues serving families below the median income threshold.</p>
<p>The partnership, which begins this fall, will serve an estimated 280 youth players in the greater Detroit area. Each league will receive four hours per week of dedicated practice time at no cost to participating families.</p>
<p>Rink staff will also receive cultural competency training and family welcome workshops to ensure every player and parent feels safe and included.</p>
<p>"Detroit has always had hockey in its soul," said our Programs Director. "We're making sure that soul belongs to every kid in this city — not just the ones whose families can afford it."</p>`,
    tags: ["Community", "Programs", "Ice Time", "Detroit"],
    featured: true,
    published: true,
  },
  {
    id: "4",
    slug: "spring-gala-2026-recap",
    title: "2026 Spring Gala Raises Record $420,000 in One Evening",
    date: "2026-03-22",
    category: "Events",
    author: "HHI Events Team",
    excerpt:
      "Our annual Spring Gala attracted 300+ supporters and set a new single-night fundraising record for the organization.",
    content: `<p>The Hockey Heart Initiative 2026 Spring Gala was a night to remember. Held at the Grand Ballroom of the Meridian Hotel, the event welcomed over 300 supporters, corporate partners, players, and community leaders for an evening of celebration — and record-breaking generosity.</p>
<p>Total funds raised: <strong>$420,000</strong> — the highest single-night total in our organization's history.</p>
<p>Highlights of the evening included a live auction featuring signed memorabilia from Andrei Svechnikov, a keynote from three youth program graduates now playing at the college level, and a surprise performance by a youth choir from one of our partner communities.</p>
<p>Proceeds will be distributed across all six program areas, with priority given to the Equipment & Gear and Ice Time funds, which are at highest capacity need heading into the fall season.</p>`,
    tags: ["Gala", "Events", "Fundraising", "Milestone"],
    featured: false,
    published: true,
  },
  {
    id: "5",
    slug: "mental-health-hockey-program",
    title: "New Mental Health & Hockey Program Launches This Fall",
    date: "2026-03-05",
    category: "Programs",
    author: "HHI Health Team",
    excerpt:
      "HHI is partnering with licensed counselors to integrate mental wellness sessions alongside weekly hockey training for at-risk youth.",
    content: `<p>Hockey is more than a sport — it builds discipline, resilience, teamwork, and identity. Hockey Heart Initiative is now channeling those benefits into a structured mental health support program launching this fall.</p>
<p>In partnership with licensed youth counselors and sports psychologists, we will integrate weekly 30-minute wellness check-ins alongside our hockey training sessions for at-risk youth ages 10–17.</p>
<p>The program is designed to be fully voluntary, trauma-informed, and culturally responsive. All counselors have been selected based on experience working with youth in underserved communities.</p>
<p>"The ice is a great equalizer," our program lead explained. "But what a kid carries in their head off the ice matters just as much as what they do on it. This program addresses both."</p>
<p>Applications for the fall cohort will open in July. Priority will be given to youth already enrolled in HHI programs.</p>`,
    tags: ["Mental Health", "Programs", "Youth", "Wellness"],
    featured: false,
    published: true,
  },
  {
    id: "6",
    slug: "annual-impact-report-2025",
    title: "2025 Annual Impact Report: 4,200 Lives Changed",
    date: "2026-02-14",
    category: "Impact",
    author: "HHI Research Team",
    excerpt:
      "Our 2025 Annual Impact Report documents 4,200 youth served, $1.2M in gear donated, and programs active in 14 states.",
    content: `<p>We are proud to release the Hockey Heart Initiative 2025 Annual Impact Report — a full account of where your generosity went, who it reached, and what it changed.</p>
<h3>Key Statistics</h3>
<ul>
  <li><strong>4,200 youth served</strong> across all programs</li>
  <li><strong>$1.2M in equipment</strong> donated and distributed</li>
  <li><strong>14 states</strong> with active HHI programs</li>
  <li><strong>47 rink partnerships</strong> providing subsidized ice time</li>
  <li><strong>312 coaching hours</strong> delivered by certified trainers</li>
</ul>
<p>The report also includes testimonials from program graduates, a financial transparency breakdown, and our 2026–2027 strategic roadmap.</p>
<p>We are a 501(c)(3) nonprofit and believe in full financial transparency. Every dollar is accounted for. Read the full report at the link below.</p>`,
    tags: ["Impact", "Annual Report", "Statistics", "Transparency"],
    featured: false,
    published: true,
  },
];

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    slug: "winter-equipment-drive-2026",
    title: "Winter Equipment Drive 2026",
    description:
      "Provide complete gear packages — skates, helmet, pads, and stick — to youth players who cannot afford equipment. Every kit puts a kid on the ice.",
    goal: 150000,
    raised: 156200,
    deadline: "2026-09-30",
    category: "Equipment & Gear",
    featured: true,
    active: true,
    content: `<p>Equipment is the single biggest barrier keeping youth off the ice. A complete starter kit costs $300–$600 — an impossible expense for many families.</p>
<p>Your donation to the Winter Equipment Drive funds complete gear packages including skates fitted to the child's foot, a certified safety helmet, full pad sets, and a stick sized to their height and play position.</p>
<p>Every kit is fitted individually and distributed through our network of 47 partner rinks and community centers.</p>`,
  },
  {
    id: "2",
    slug: "community-rink-fund",
    title: "Community Rink Access Fund",
    description:
      "Subsidize ice time for youth leagues in underserved neighborhoods so every child can practice, train, and compete regardless of income.",
    goal: 200000,
    raised: 89400,
    deadline: "2026-12-31",
    category: "Ice Time & Training Support",
    featured: true,
    active: true,
    content: `<p>Ice time is expensive. Even when a family can afford gear, the cost of rink hours — often $300–$500 per month — keeps youth players off the ice.</p>
<p>The Community Rink Access Fund subsidizes practice sessions for youth leagues in neighborhoods with median household incomes below $50,000.</p>
<p>Funds are distributed directly to partner rinks in exchange for guaranteed hours reserved for qualifying youth leagues.</p>`,
  },
  {
    id: "3",
    slug: "youth-coaching-program",
    title: "Youth Coaching Certification Program",
    description:
      "Train and certify coaches from underserved communities so local programs can grow from within — building lasting hockey infrastructure in every neighborhood.",
    goal: 75000,
    raised: 42100,
    deadline: "2027-03-31",
    category: "Youth Hockey Development",
    featured: false,
    active: true,
  },
  {
    id: "4",
    slug: "hockey-education-initiative",
    title: "Hockey Education Initiative",
    description:
      "Combine hockey with academic tutoring and STEM enrichment so youth players grow both on and off the ice.",
    goal: 100000,
    raised: 31500,
    deadline: "2027-06-30",
    category: "Hockey Education",
    featured: false,
    active: true,
  },
  {
    id: "5",
    slug: "community-outreach-van",
    title: "Community Outreach Mobile Program",
    description:
      "Fund a mobile outreach van that brings hockey awareness, gear fittings, and program sign-ups directly to schools and community centers.",
    goal: 50000,
    raised: 18900,
    deadline: "2026-10-31",
    category: "Community Outreach",
    featured: false,
    active: true,
  },
  {
    id: "6",
    slug: "spring-gala-2027",
    title: "Spring Gala 2027 Sponsorship",
    description:
      "Become a corporate or individual sponsor for our 2027 Spring Gala — our annual flagship fundraising event.",
    goal: 500000,
    raised: 85000,
    deadline: "2027-04-30",
    category: "General Fund",
    featured: true,
    active: true,
  },
];

const DEFAULT_PAYMENT: PaymentSettings = {
  paystackPublicKey: "",
  paystackSecretKey: "",
  paystackEnabled: false,
  cardEnabled: false,
  bankTransferEnabled: true,
  cryptoEnabled: false,
  cryptoWallets: {
    bitcoin: "",
    ethereum: "",
    usdtTrc20: "",
    usdtErc20: "",
    solana: "",
  },
};

// ── Articles ──────────────────────────────────────────────────────────────
export function getArticles(): NewsArticle[] {
  const stored = read<NewsArticle[] | null>(KEYS.articles, null);
  if (!stored) {
    write(KEYS.articles, SEED_ARTICLES);
    return SEED_ARTICLES;
  }
  return stored;
}

export function getPublishedArticles(): NewsArticle[] {
  return getArticles().filter((a) => a.published);
}

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return getArticles().find((a) => a.slug === slug);
}

export function saveArticle(article: NewsArticle) {
  const articles = getArticles();
  const idx = articles.findIndex((a) => a.id === article.id);
  if (idx >= 0) articles[idx] = article;
  else articles.unshift(article);
  write(KEYS.articles, articles);
}

export function deleteArticle(id: string) {
  write(
    KEYS.articles,
    getArticles().filter((a) => a.id !== id)
  );
}

// ── Campaigns ─────────────────────────────────────────────────────────────
export function getCampaigns(): Campaign[] {
  const stored = read<Campaign[] | null>(KEYS.campaigns, null);
  if (!stored) {
    write(KEYS.campaigns, SEED_CAMPAIGNS);
    return SEED_CAMPAIGNS;
  }
  return stored;
}

export function getActiveCampaigns(): Campaign[] {
  return getCampaigns().filter((c) => c.active);
}

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return getCampaigns().find((c) => c.slug === slug);
}

export function saveCampaign(campaign: Campaign) {
  const campaigns = getCampaigns();
  const idx = campaigns.findIndex((c) => c.id === campaign.id);
  if (idx >= 0) campaigns[idx] = campaign;
  else campaigns.unshift(campaign);
  write(KEYS.campaigns, campaigns);
}

export function deleteCampaign(id: string) {
  write(
    KEYS.campaigns,
    getCampaigns().filter((c) => c.id !== id)
  );
}

// ── Payment Settings ──────────────────────────────────────────────────────
export function getPaymentSettings(): PaymentSettings {
  return read<PaymentSettings>(KEYS.payments, DEFAULT_PAYMENT);
}

export function savePaymentSettings(settings: PaymentSettings) {
  write(KEYS.payments, settings);
}

// ── Transactions ──────────────────────────────────────────────────────────
export function getTransactions(): Transaction[] {
  return read<Transaction[]>(KEYS.transactions, []);
}

// ── Activity Log ──────────────────────────────────────────────────────────
export function getActivityLog(): ActivityLogEntry[] {
  return read<ActivityLogEntry[]>(KEYS.activityLog, []);
}

export function logActivity(
  action: string,
  section: string,
  detail: string
) {
  const log = getActivityLog();
  log.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    section,
    detail,
  });
  write(KEYS.activityLog, log.slice(0, 200)); // keep last 200 entries
}
