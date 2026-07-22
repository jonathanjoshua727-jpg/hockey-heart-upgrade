import { Shell } from "@/components/layout/Shell";
import { NewsCard } from "@/components/NewsCard";
import news1Image from "@assets/news-1.jpg";
import news2Image from "@assets/news-2.jpg";
import camp1Image from "@assets/campaign-1.jpg";
import camp2Image from "@assets/campaign-2.jpg";

export default function News() {
  const articles = [
    {
      id: "street-hockey-success",
      title: "Summer Street Hockey Program Reaches New Heights",
      date: "July 10, 2026",
      category: "Program Update",
      excerpt: "Over 1,200 kids participated in our free summer street hockey camps across five cities, breaking previous attendance records and bringing communities together.",
      image: news1Image
    },
    {
      id: "hospital-partnership",
      title: "New Partnership with Children's Memorial",
      date: "June 25, 2026",
      category: "Health Initiative",
      excerpt: "We are thrilled to announce a $100,000 commitment to the new pediatric oncology playroom at Children's Memorial Hospital, providing interactive spaces for recovering patients.",
      image: news2Image
    },
    {
      id: "annual-gala-results",
      title: "Winter Gala Raises $500K for Equipment Grants",
      date: "May 18, 2026",
      category: "Event",
      excerpt: "Thanks to our generous donors, this year's Winter Gala exceeded all expectations. The funds will directly purchase 1,000 sets of gear for the upcoming season.",
      image: camp1Image
    },
    {
      id: "mobile-clinic-fleet",
      title: "Expanding the Mobile Clinic Fleet",
      date: "April 3, 2026",
      category: "Health Initiative",
      excerpt: "With the addition of two new customized RVs, our mobile pediatric screening units can now reach rural counties that lack dedicated pediatricians.",
      image: camp2Image
    },
    {
      id: "coach-of-the-year",
      title: "Volunteer Coach of the Year: Michael T.",
      date: "March 15, 2026",
      category: "Community",
      excerpt: "Michael has dedicated over 400 hours this season alone to coaching our inner-city youth league, ensuring every player feels valued and supported.",
      image: news1Image
    },
    {
      id: "nutrition-guide",
      title: "Launch of the 'Fuel for the Ice' Nutrition Guide",
      date: "February 8, 2026",
      category: "Education",
      excerpt: "We've partnered with sports nutritionists to create a free, accessible guide for families to help their young athletes eat healthy on a budget.",
      image: news2Image
    }
  ];

  return (
    <Shell>
      <section className="bg-primary py-20 text-center text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">News & Updates</h1>
          <p className="text-xl text-primary-foreground/80">
            Read the latest stories of impact, program updates, and announcements from the Hockey Hearts Initiative.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <NewsCard key={article.id} {...article} />
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
