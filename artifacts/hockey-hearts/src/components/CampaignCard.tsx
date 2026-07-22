import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  category: "Hockey" | "Health";
  goal: number;
  raised: number;
  deadline: string;
  image: string;
}

export function CampaignCard({ id, title, description, category, goal, raised, deadline, image }: CampaignCardProps) {
  const progress = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <div className="group flex flex-col bg-card text-card-foreground rounded-2xl border border-card-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 z-20">
          <Badge className={category === "Hockey" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/90"}>
            {category}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 p-6">
        <h3 className="font-serif text-xl font-bold mb-2 text-primary">{title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
          {description}
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-primary">${raised.toLocaleString()} raised</span>
            <span className="text-muted-foreground">of ${goal.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2 bg-muted [&>div]:bg-secondary" />
          <div className="text-xs text-muted-foreground text-right">
            Deadline: {deadline}
          </div>
        </div>
        
        <Link 
          href={`/donate?campaign=${id}`}
          className={cn(
            buttonVariants({ variant: "default" }),
            "w-full font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Support Campaign
        </Link>
      </div>
    </div>
  );
}
