import { buttonVariants } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  image: string;
  heading: string;
  subheading: string;
}

export function HeroSection({ image, heading, subheading }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt="Hockey Hearts Hero" 
          className="w-full h-full object-cover object-center"
        />
        {/* Navy to ice blue gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-secondary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-primary/40" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8 flex flex-col items-center text-center">
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">
            {heading}
          </h1>
          <p className="text-lg md:text-2xl text-white/90 font-serif italic mb-10 max-w-2xl mx-auto leading-relaxed">
            "{subheading}"
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/donate"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 rounded-full font-semibold shadow-lg"
              )}
            >
              Donate Now
            </Link>
            <Link 
              href="/about"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10 text-lg px-8 py-6 rounded-full font-semibold"
              )}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative curve */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-none z-20 translate-y-[1px]">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="w-full h-[60px] md:h-[100px] fill-background"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,115.15,198.81,105.15,240.23,99.1,281.33,80.11,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
}
