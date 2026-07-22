import { Link } from "wouter";

interface NewsCardProps {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  image: string;
}

export function NewsCard({ id, title, date, category, excerpt, image }: NewsCardProps) {
  return (
    <Link href={`/news/${id}`} className="group flex flex-col bg-card rounded-2xl border border-card-border overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-6">
        <div className="text-xs text-muted-foreground mb-3">{date}</div>
        <h3 className="font-serif text-xl font-bold mb-3 text-primary group-hover:text-secondary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
          {excerpt}
        </p>
        <div className="text-secondary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          Read more <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
