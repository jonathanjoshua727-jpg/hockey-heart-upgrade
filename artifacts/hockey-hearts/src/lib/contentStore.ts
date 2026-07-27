// CMS content store backed by localStorage
// Falls back to static seed data when no admin data exists

// ── Interfaces ────────────────────────────────────────────────────────────

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
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
    instructions: string;
  };
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  donorName: string;
  donorEmail: string;
  cause: string;
  reference: string;
  anonymous?: boolean;
  notes?: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  section: string;
  detail: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
  active: boolean;
  order: number;
  imageUrl?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  published: boolean;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  impactStats: Array<{ number: string; label: string }>;
  footerTagline: string;
  ein: string;
  metaDescription: string;
}

export interface HomepageContent {
  heroHeading: string;
  heroSubheading: string;
  missionTitle: string;
  missionText: string;
  featuredCampaignIds: string[];
}

export interface GalleryImage {
  id: string;
  name: string;
  url: string;
  section: string;
  alt: string;
  uploadedAt: string;
}

export interface DonationCause {
  id: string;
  label: string;
  description: string;
  active: boolean;
  order: number;
}

export interface PageContent {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

// ── Keys ──────────────────────────────────────────────────────────────────
const KEYS = {
  articles: 'hhi_articles',
  campaigns: 'hhi_campaigns',
  payments: 'hhi_payment_settings',
  transactions: 'hhi_transactions',
  activityLog: 'hhi_activity_log',
  programs: 'hhi_programs',
  faqs: 'hhi_faqs',
  contactInfo: 'hhi_contact_info',
  siteSettings: 'hhi_site_settings',
  homepageContent: 'hhi_homepage_content',
  galleryImages: 'hhi_gallery_images',
  donationCauses: 'hhi_donation_causes',
  pageContents: 'hhi_page_contents',
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
    id: '1',
    slug: 'andrei-svechnikov-lead-ambassador',
    title: 'Andrei Svechnikov Named Lead Ambassador of Hockey Heart Initiative',
    date: '2026-05-12',
    category: 'Announcement',
    author: 'HHI Communications Team',
    excerpt:
      'NHL All-Star Andrei Svechnikov has officially joined as our Lead Ambassador, pledging a personal $200,000 donation to the equipment grant fund.',
    content: `<p>Hockey Heart Initiative is thrilled to announce that Andrei Svechnikov, All-Star forward for the Carolina Hurricanes, has officially joined our organization as Lead Ambassador.</p>
<p>Svechnikov — whose meteoric NHL career has made him one of the most dynamic players in the league — grew up understanding firsthand how financial barriers can stand between a talented young player and the ice. Today, he channels that experience into direct action.</p>
<p>"Every kid who loves hockey deserves a shot," Svechnikov said at the announcement. "I was lucky. Not every kid is. That's why I'm here."</p>
<p>As part of his ambassadorial commitment, Svechnikov has pledged a personal donation of $200,000 to the Equipment & Gear fund and will participate in three seasons of active advocacy — including youth hockey clinics, hospital visits, and fundraising appearances.</p>
<p>We are honored to have Andrei as the face of our mission and look forward to the impact we will create together.</p>`,
    tags: ['Ambassador', 'Announcement', 'Andrei Svechnikov'],
    featured: true,
    published: true,
    pinned: true,
    imageUrl: 'news-1',
  },
  {
    id: '2',
    slug: 'winter-equipment-drive-2026',
    title: 'Winter Equipment Drive Surpasses $150,000 Goal',
    date: '2026-04-28',
    category: 'Campaign Update',
    author: 'HHI Campaign Team',
    excerpt:
      'Our Winter Equipment Drive has exceeded its fundraising goal, providing gear to over 340 youth players across eight states.',
    content: `<p>We are beyond proud to share that the Hockey Heart Initiative Winter Equipment Drive has surpassed its $150,000 fundraising goal — a milestone achieved through the generosity of donors from coast to coast.</p>
<p>The funds raised will provide skates, helmets, pads, and sticks to 340+ youth players in eight states who previously lacked access to proper protective gear.</p>
<p>Distribution is underway and will be completed before the start of the fall season. Each recipient family will receive a complete gear package fitted to their child's size and level of play.</p>
<p>Thank you to every donor, volunteer, and partner who made this possible. The ice is waiting.</p>`,
    tags: ['Equipment', 'Campaign', 'Milestone'],
    featured: false,
    published: true,
    imageUrl: 'campaign-3',
  },
  {
    id: '3',
    slug: 'community-rink-partnership-detroit',
    title: 'New Rink Partnership Brings Free Ice Time to Detroit Youth',
    date: '2026-04-10',
    category: 'Programs',
    author: 'HHI Programs Team',
    excerpt:
      'HHI has partnered with three Detroit-area rinks to offer 12 hours of subsidized weekly ice time to youth hockey leagues serving low-income families.',
    content: `<p>Hockey Heart Initiative has formalized partnerships with three Detroit-area ice rinks to provide 12 hours of subsidized weekly ice time exclusively for youth hockey leagues serving families below the median income threshold.</p>
<p>The partnership, which begins this fall, will serve an estimated 280 youth players in the greater Detroit area. Each league will receive four hours per week of dedicated practice time at no cost to participating families.</p>
<p>Rink staff will also receive cultural competency training and family welcome workshops to ensure every player and parent feels safe and included.</p>
<p>"Detroit has always had hockey in its soul," said our Programs Director. "We're making sure that soul belongs to every kid in this city — not just the ones whose families can afford it."</p>`,
    tags: ['Community', 'Programs', 'Ice Time', 'Detroit'],
    featured: true,
    published: true,
    imageUrl: 'campaign-1',
  },
  {
    id: '4',
    slug: 'spring-gala-2026-recap',
    title: '2026 Spring Gala Raises Record $420,000 in One Evening',
    date: '2026-03-22',
    category: 'Events',
    author: 'HHI Events Team',
    excerpt:
      'Our annual Spring Gala attracted 300+ supporters and set a new single-night fundraising record for the organization.',
    content: `<p>The Hockey Heart Initiative 2026 Spring Gala was a night to remember. Held at the Grand Ballroom of the Meridian Hotel, the event welcomed over 300 supporters, corporate partners, players, and community leaders for an evening of celebration — and record-breaking generosity.</p>
<p>Total funds raised: <strong>$420,000</strong> — the highest single-night total in our organization's history.</p>
<p>Highlights of the evening included a live auction featuring signed memorabilia from Andrei Svechnikov, a keynote from three youth program graduates now playing at the college level, and a surprise performance by a youth choir from one of our partner communities.</p>
<p>Proceeds will be distributed across all six program areas, with priority given to the Equipment & Gear and Ice Time funds, which are at highest capacity need heading into the fall season.</p>`,
    tags: ['Gala', 'Events', 'Fundraising', 'Milestone'],
    featured: false,
    published: true,
    imageUrl: 'news-2',
  },
  {
    id: '5',
    slug: 'mental-health-hockey-program',
    title: 'New Mental Health & Hockey Program Launches This Fall',
    date: '2026-03-05',
    category: 'Programs',
    author: 'HHI Health Team',
    excerpt:
      'HHI is partnering with licensed counselors to integrate mental wellness sessions alongside weekly hockey training for at-risk youth.',
    content: `<p>Hockey is more than a sport — it builds discipline, resilience, teamwork, and identity. Hockey Heart Initiative is now channeling those benefits into a structured mental health support program launching this fall.</p>
<p>In partnership with licensed youth counselors and sports psychologists, we will integrate weekly 30-minute wellness check-ins alongside our hockey training sessions for at-risk youth ages 10–17.</p>
<p>The program is designed to be fully voluntary, trauma-informed, and culturally responsive. All counselors have been selected based on experience working with youth in underserved communities.</p>
<p>"The ice is a great equalizer," our program lead explained. "But what a kid carries in their head off the ice matters just as much as what they do on it. This program addresses both."</p>
<p>Applications for the fall cohort will open in July. Priority will be given to youth already enrolled in HHI programs.</p>`,
    tags: ['Mental Health', 'Programs', 'Youth', 'Wellness'],
    featured: false,
    published: true,
    imageUrl: 'campaign-2',
  },
  {
    id: '6',
    slug: 'annual-impact-report-2025',
    title: '2025 Annual Impact Report: 4,200 Lives Changed',
    date: '2026-02-14',
    category: 'Impact',
    author: 'HHI Research Team',
    excerpt:
      'Our 2025 Annual Impact Report documents 4,200 youth served, $1.2M in gear donated, and programs active in 14 states.',
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
<p>We are a 501(c)(3) nonprofit and believe in full financial transparency. Every dollar is accounted for.</p>`,
    tags: ['Impact', 'Annual Report', 'Statistics', 'Transparency'],
    featured: false,
    published: true,
    imageUrl: 'news-1',
  },
];

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    slug: 'winter-equipment-drive-2026',
    title: 'Winter Equipment Drive 2026',
    description:
      'Provide complete gear packages — skates, helmet, pads, and stick — to youth players who cannot afford equipment. Every kit puts a kid on the ice.',
    goal: 150000,
    raised: 156200,
    deadline: '2026-09-30',
    category: 'Equipment & Gear',
    featured: true,
    active: true,
    imageUrl: 'campaign-3',
    content: `<p>Equipment is the single biggest barrier keeping youth off the ice. A complete starter kit costs $300–$600 — an impossible expense for many families.</p>
<p>Your donation to the Winter Equipment Drive funds complete gear packages including skates fitted to the child's foot, a certified safety helmet, full pad sets, and a stick sized to their height and play position.</p>
<p>Every kit is fitted individually and distributed through our network of 47 partner rinks and community centers.</p>`,
  },
  {
    id: '2',
    slug: 'community-rink-fund',
    title: 'Community Rink Access Fund',
    description:
      'Subsidize ice time for youth leagues in underserved neighborhoods so every child can practice, train, and compete regardless of income.',
    goal: 200000,
    raised: 89400,
    deadline: '2026-12-31',
    category: 'Ice Time & Training Support',
    featured: true,
    active: true,
    imageUrl: 'campaign-2',
    content: `<p>Ice time is expensive. Even when a family can afford gear, the cost of rink hours — often $300–$500 per month — keeps youth players off the ice.</p>
<p>The Community Rink Access Fund subsidizes practice sessions for youth leagues in neighborhoods with median household incomes below $50,000.</p>
<p>Funds are distributed directly to partner rinks in exchange for guaranteed hours reserved for qualifying youth leagues.</p>`,
  },
  {
    id: '3',
    slug: 'youth-coaching-program',
    title: 'Youth Coaching Certification Program',
    description:
      'Train and certify coaches from underserved communities so local programs can grow from within — building lasting hockey infrastructure in every neighborhood.',
    goal: 75000,
    raised: 42100,
    deadline: '2027-03-31',
    category: 'Youth Hockey Development',
    featured: false,
    active: true,
    imageUrl: 'about-team',
  },
  {
    id: '4',
    slug: 'hockey-education-initiative',
    title: 'Hockey Education Initiative',
    description:
      'Combine hockey with academic tutoring and STEM enrichment so youth players grow both on and off the ice.',
    goal: 100000,
    raised: 31500,
    deadline: '2027-06-30',
    category: 'Hockey Education',
    featured: false,
    active: true,
    imageUrl: 'campaign-1',
  },
  {
    id: '5',
    slug: 'community-outreach-van',
    title: 'Community Outreach Mobile Program',
    description:
      'Fund a mobile outreach van that brings hockey awareness, gear fittings, and program sign-ups directly to schools and community centers.',
    goal: 50000,
    raised: 18900,
    deadline: '2026-10-31',
    category: 'Community Outreach',
    featured: false,
    active: true,
    imageUrl: 'news-2',
  },
  {
    id: '6',
    slug: 'spring-gala-2027',
    title: 'Spring Gala 2027 Sponsorship',
    description:
      'Become a corporate or individual sponsor for our 2027 Spring Gala — our annual flagship fundraising event.',
    goal: 500000,
    raised: 85000,
    deadline: '2027-04-30',
    category: 'General Fund',
    featured: true,
    active: true,
    imageUrl: 'news-1',
  },
];

const DEFAULT_PAYMENT: PaymentSettings = {
  paystackPublicKey: '',
  paystackSecretKey: '',
  paystackEnabled: false,
  cardEnabled: false,
  bankTransferEnabled: true,
  cryptoEnabled: false,
  cryptoWallets: {
    bitcoin: '',
    ethereum: '',
    usdtTrc20: '',
    usdtErc20: '',
    solana: '',
  },
  bankDetails: {
    bankName: '',
    accountName: 'Hockey Heart Initiative',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    instructions:
      'Please include your full name and email address as the payment reference so we can match your donation.',
  },
};

const SEED_PROGRAMS: Program[] = [
  {
    id: '1',
    title: 'Equipment & Gear Fund',
    description:
      'Complete hockey gear packages for youth who cannot afford the cost of equipment — skates, helmet, pads, and stick.',
    content: `<p>A full starter kit can cost $300–$600, which is simply out of reach for many families. Our Equipment & Gear Fund closes that gap with individually fitted gear packages distributed through 47 partner rinks.</p>`,
    icon: '🏒',
    active: true,
    order: 0,
    imageUrl: 'campaign-3',
  },
  {
    id: '2',
    title: 'Ice Time Access',
    description:
      'Subsidizing rink hours for youth leagues in underserved neighborhoods, ensuring every player can practice and compete.',
    content: `<p>Even when gear is available, ice time remains prohibitively expensive. We subsidize practice hours at partner rinks, reserving time exclusively for qualifying youth leagues.</p>`,
    icon: '⛸️',
    active: true,
    order: 1,
    imageUrl: 'campaign-1',
  },
  {
    id: '3',
    title: 'Youth Coaching Certification',
    description:
      'Funding USA Hockey certification and background checks for volunteer coaches in low-income communities.',
    content: `<p>Trained coaches are essential to safe, structured programs. We fund certification courses for coaches from within the communities we serve, building lasting local leadership.</p>`,
    icon: '🎓',
    active: true,
    order: 2,
    imageUrl: 'about-team',
  },
  {
    id: '4',
    title: 'Mental Health & Hockey',
    description:
      'Integrating licensed counseling and mental wellness sessions alongside weekly hockey training for at-risk youth.',
    content: `<p>In partnership with licensed youth counselors, we offer voluntary weekly wellness check-ins for youth ages 10–17 enrolled in our programs.</p>`,
    icon: '🧠',
    active: true,
    order: 3,
    imageUrl: 'campaign-2',
  },
  {
    id: '5',
    title: 'Mobile Outreach Program',
    description:
      'Bringing hockey awareness, gear fittings, and program sign-ups directly to schools and community centers.',
    content: `<p>Our mobile outreach van visits schools and community centers in areas without easy rink access, bringing gear fittings and program enrollment directly to families.</p>`,
    icon: '🚐',
    active: true,
    order: 4,
    imageUrl: 'news-2',
  },
  {
    id: '6',
    title: 'Hockey Education Initiative',
    description:
      'Combining hockey with academic tutoring and STEM enrichment so youth grow both on and off the ice.',
    content: `<p>Our education program pairs hockey practice with after-school tutoring, STEM projects, and mentorship — supporting the whole child, not just the athlete.</p>`,
    icon: '📚',
    active: true,
    order: 5,
    imageUrl: 'campaign-1',
  },
];

const SEED_FAQS: Faq[] = [
  // About Us
  {
    id: 'f1',
    question: 'What is Hockey Heart Initiative?',
    answer:
      'Hockey Heart Initiative is a 501(c)(3) nonprofit organization dedicated to removing financial barriers that prevent youth from participating in hockey. We fund equipment, ice time, coaching, and community programs for children in underserved communities.',
    category: 'About Us',
    order: 0,
    published: true,
  },
  {
    id: 'f2',
    question: 'Who does Hockey Heart Initiative serve?',
    answer:
      'We serve youth ages 5–18 from families facing financial hardship who want to participate in hockey but cannot afford equipment, league fees, or ice time. We partner with rinks, schools, and community organizations in 14+ states.',
    category: 'About Us',
    order: 1,
    published: true,
  },
  {
    id: 'f3',
    question: 'Is Hockey Heart Initiative a registered nonprofit?',
    answer:
      'Yes. Hockey Heart Initiative is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible to the extent permitted by law. You will receive a donation acknowledgment letter for your records.',
    category: 'About Us',
    order: 2,
    published: true,
  },
  {
    id: 'f4',
    question: 'Who is Andrei Svechnikov?',
    answer:
      "Andrei Svechnikov is an NHL All-Star forward for the Carolina Hurricanes and the Lead Ambassador of Hockey Heart Initiative. He has pledged a personal $200,000 donation to our Equipment & Gear fund and actively participates in our programs and outreach events.",
    category: 'About Us',
    order: 3,
    published: true,
  },
  // Donations
  {
    id: 'f5',
    question: 'What is the minimum donation?',
    answer:
      'Our suggested minimum donation is $50, which covers the cost of a child\'s league registration fee for one season. However, no gift is too small — every dollar goes directly toward our programs.',
    category: 'Donations',
    order: 0,
    published: true,
  },
  {
    id: 'f6',
    question: 'What payment methods do you accept?',
    answer:
      'We accept Bank Transfer, Credit/Debit Card, and Cryptocurrency (Bitcoin, Ethereum, USDT TRC20, USDT ERC20, and Solana). Please contact us at contacthockeyheartinitiative@gmail.com to complete your donation or ask about payment options.',
    category: 'Donations',
    order: 1,
    published: true,
  },
  {
    id: 'f7',
    question: 'Can I designate my donation to a specific cause?',
    answer:
      'Yes. When donating, you can designate your gift to: General Fund, Youth Hockey Development, Community Hockey Programs, Equipment & Gear, Ice Time & Training Support, or Community Outreach.',
    category: 'Donations',
    order: 2,
    published: true,
  },
  {
    id: 'f8',
    question: 'Are donations tax-deductible?',
    answer:
      'Yes. As a 501(c)(3) organization, all donations to Hockey Heart Initiative are tax-deductible. You will receive a written acknowledgment of your contribution for tax purposes.',
    category: 'Donations',
    order: 3,
    published: true,
  },
  {
    id: 'f9',
    question: 'Can I set up a recurring donation?',
    answer:
      'Recurring donation options are currently being configured. Please contact us at contacthockeyheartinitiative@gmail.com and we will set up a recurring arrangement manually.',
    category: 'Donations',
    order: 4,
    published: true,
  },
  // Programs
  {
    id: 'f10',
    question: 'How does a child apply for equipment assistance?',
    answer:
      'Applications are accepted through partner rinks and community centers in our network. Contact us at contacthockeyheartinitiative@gmail.com with the child\'s name, age, location, and the specific need. We will connect you with the appropriate program.',
    category: 'Programs',
    order: 0,
    published: true,
  },
  {
    id: 'f11',
    question: 'Does HHI operate its own rinks or leagues?',
    answer:
      'No. We partner with existing rinks, leagues, and community organizations to fund access rather than build new infrastructure. This allows us to serve more youth more quickly and build on trusted local relationships.',
    category: 'Programs',
    order: 1,
    published: true,
  },
  {
    id: 'f12',
    question: 'Can adults volunteer with Hockey Heart Initiative?',
    answer:
      'Absolutely. We welcome volunteers for equipment distributions, youth clinics, fundraising events, and administrative support. Contact us to learn about current opportunities in your area.',
    category: 'Programs',
    order: 2,
    published: true,
  },
  // Campaigns
  {
    id: 'f13',
    question: 'Can my organization create a fundraiser for HHI?',
    answer:
      'Yes! Corporate and community fundraisers are welcome. Contact us at contacthockeyheartinitiative@gmail.com to discuss your idea and we will provide all necessary materials and guidance.',
    category: 'Campaigns & Fundraising',
    order: 0,
    published: true,
  },
  {
    id: 'f14',
    question: 'How are campaign funds tracked?',
    answer:
      'Campaign-specific donations are tracked separately and applied only to the designated campaign. We publish impact reports showing exactly how campaign funds were spent.',
    category: 'Campaigns & Fundraising',
    order: 1,
    published: true,
  },
];

const DEFAULT_CONTACT: ContactInfo = {
  email: 'contacthockeyheartinitiative@gmail.com',
  phone: '',
  address: 'Coming Soon',
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },
};

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Hockey Heart Initiative',
  tagline: 'Play. Heal. Thrive.',
  impactStats: [
    { number: '15k+', label: 'Kids Reached' },
    { number: '$2.4M', label: 'Funds Distributed' },
    { number: '8,500', label: 'Equipment Sets' },
    { number: '120', label: 'Health Programs Funded' },
  ],
  footerTagline:
    "Empowering youth through hockey and championing children's health initiatives. We believe every child deserves the chance to play, heal, and thrive.",
  ein: '',
  metaDescription:
    "Hockey Heart Initiative empowers youth through hockey and advocates for children's health and well-being.",
};

const DEFAULT_HOMEPAGE: HomepageContent = {
  heroHeading: 'Play. Heal. Thrive.',
  heroSubheading:
    'Empowering youth through the discipline of hockey and championing their right to health and opportunity.',
  missionTitle: 'We believe every child deserves a fair shot—on the ice and in life.',
  missionText:
    "The Hockey Heart Initiative bridges the gap between athletic development and fundamental well-being. By funding youth hockey programs and supporting vital children's health initiatives, we are building a stronger, healthier future for our communities.",
  featuredCampaignIds: ['1', '2', '6'],
};

const SEED_DONATION_CAUSES: DonationCause[] = [
  {
    id: 'general',
    label: 'General Fund',
    description: 'Support all HHI programs equally',
    active: true,
    order: 0,
  },
  {
    id: 'youth-hockey',
    label: 'Youth Hockey Development',
    description: 'Coaching, training, and skill development',
    active: true,
    order: 1,
  },
  {
    id: 'community',
    label: 'Community Hockey Programs',
    description: 'Local league and community programs',
    active: true,
    order: 2,
  },
  {
    id: 'equipment',
    label: 'Equipment & Gear',
    description: 'Hockey gear for youth who need it',
    active: true,
    order: 3,
  },
  {
    id: 'ice-time',
    label: 'Ice Time & Training',
    description: 'Subsidized ice time for youth leagues',
    active: true,
    order: 4,
  },
  {
    id: 'outreach',
    label: 'Community Outreach',
    description: 'Bringing hockey to underserved areas',
    active: true,
    order: 5,
  },
];

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
  return getArticles()
    .filter((a) => a.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
  write(KEYS.articles, getArticles().filter((a) => a.id !== id));
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

export function getFeaturedCampaigns(): Campaign[] {
  return getCampaigns().filter((c) => c.featured && c.active);
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
  write(KEYS.campaigns, getCampaigns().filter((c) => c.id !== id));
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
  return read<Transaction[]>(KEYS.transactions, []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function saveTransaction(tx: Transaction) {
  const existing = read<Transaction[]>(KEYS.transactions, []);
  existing.unshift(tx);
  write(KEYS.transactions, existing);
}

export function updateTransactionStatus(id: string, status: Transaction['status']) {
  const txs = read<Transaction[]>(KEYS.transactions, []);
  const idx = txs.findIndex((t) => t.id === id);
  if (idx >= 0) {
    txs[idx] = { ...txs[idx], status };
    write(KEYS.transactions, txs);
  }
}

export function deleteTransaction(id: string) {
  write(KEYS.transactions, read<Transaction[]>(KEYS.transactions, []).filter((t) => t.id !== id));
}

// ── Activity Log ──────────────────────────────────────────────────────────
export function getActivityLog(): ActivityLogEntry[] {
  return read<ActivityLogEntry[]>(KEYS.activityLog, []);
}

export function logActivity(action: string, section: string, detail: string) {
  const log = getActivityLog();
  log.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    section,
    detail,
  });
  write(KEYS.activityLog, log.slice(0, 200));
}

// ── Programs ──────────────────────────────────────────────────────────────
export function getPrograms(): Program[] {
  const stored = read<Program[] | null>(KEYS.programs, null);
  if (!stored) {
    write(KEYS.programs, SEED_PROGRAMS);
    return SEED_PROGRAMS;
  }
  return stored.sort((a, b) => a.order - b.order);
}

export function getActivePrograms(): Program[] {
  return getPrograms().filter((p) => p.active);
}

export function saveProgram(program: Program) {
  const programs = getPrograms();
  const idx = programs.findIndex((p) => p.id === program.id);
  if (idx >= 0) programs[idx] = program;
  else programs.push(program);
  write(KEYS.programs, programs);
}

export function deleteProgram(id: string) {
  write(KEYS.programs, getPrograms().filter((p) => p.id !== id));
}

// ── FAQs ──────────────────────────────────────────────────────────────────
export function getFaqs(): Faq[] {
  const stored = read<Faq[] | null>(KEYS.faqs, null);
  if (!stored) {
    write(KEYS.faqs, SEED_FAQS);
    return SEED_FAQS;
  }
  return stored.sort((a, b) => a.order - b.order);
}

export function getPublishedFaqs(): Faq[] {
  return getFaqs().filter((f) => f.published);
}

export function saveFaq(faq: Faq) {
  const faqs = getFaqs();
  const idx = faqs.findIndex((f) => f.id === faq.id);
  if (idx >= 0) faqs[idx] = faq;
  else faqs.push(faq);
  write(KEYS.faqs, faqs);
}

export function deleteFaq(id: string) {
  write(KEYS.faqs, getFaqs().filter((f) => f.id !== id));
}

// ── Contact Info ──────────────────────────────────────────────────────────
export function getContactInfo(): ContactInfo {
  return read<ContactInfo>(KEYS.contactInfo, DEFAULT_CONTACT);
}

export function saveContactInfo(info: ContactInfo) {
  write(KEYS.contactInfo, info);
}

// ── Site Settings ─────────────────────────────────────────────────────────
export function getSiteSettings(): SiteSettings {
  return read<SiteSettings>(KEYS.siteSettings, DEFAULT_SITE_SETTINGS);
}

export function saveSiteSettings(settings: SiteSettings) {
  write(KEYS.siteSettings, settings);
}

// ── Homepage Content ──────────────────────────────────────────────────────
export function getHomepageContent(): HomepageContent {
  return read<HomepageContent>(KEYS.homepageContent, DEFAULT_HOMEPAGE);
}

export function saveHomepageContent(content: HomepageContent) {
  write(KEYS.homepageContent, content);
}

// ── Gallery Images ────────────────────────────────────────────────────────
export function getGalleryImages(): GalleryImage[] {
  return read<GalleryImage[]>(KEYS.galleryImages, []);
}

export function saveGalleryImage(img: GalleryImage) {
  const images = getGalleryImages();
  const idx = images.findIndex((i) => i.id === img.id);
  if (idx >= 0) images[idx] = img;
  else images.unshift(img);
  write(KEYS.galleryImages, images);
}

export function deleteGalleryImage(id: string) {
  write(KEYS.galleryImages, getGalleryImages().filter((i) => i.id !== id));
}

// ── Donation Causes ───────────────────────────────────────────────────────
export function getDonationCauses(): DonationCause[] {
  const stored = read<DonationCause[] | null>(KEYS.donationCauses, null);
  if (!stored) {
    write(KEYS.donationCauses, SEED_DONATION_CAUSES);
    return SEED_DONATION_CAUSES;
  }
  return stored.sort((a, b) => a.order - b.order);
}

export function getActiveDonationCauses(): DonationCause[] {
  return getDonationCauses().filter((c) => c.active);
}

export function saveDonationCause(cause: DonationCause) {
  const causes = getDonationCauses();
  const idx = causes.findIndex((c) => c.id === cause.id);
  if (idx >= 0) causes[idx] = cause;
  else causes.push(cause);
  write(KEYS.donationCauses, causes);
}

export function deleteDonationCause(id: string) {
  write(KEYS.donationCauses, getDonationCauses().filter((c) => c.id !== id));
}

// ── Page Contents ─────────────────────────────────────────────────────────
export function getPageContents(): PageContent[] {
  return read<PageContent[]>(KEYS.pageContents, []);
}

export function getPageContent(id: string): PageContent | undefined {
  return getPageContents().find((p) => p.id === id);
}

export function savePageContent(page: PageContent) {
  const pages = getPageContents();
  const idx = pages.findIndex((p) => p.id === page.id);
  if (idx >= 0) pages[idx] = page;
  else pages.push(page);
  write(KEYS.pageContents, pages);
}
