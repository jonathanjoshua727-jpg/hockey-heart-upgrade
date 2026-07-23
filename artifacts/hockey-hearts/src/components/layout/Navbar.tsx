import { Link, useLocation } from "wouter";
import { buttonVariants } from "@/components/ui/button";
import { CircleDot, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/mission", label: "Mission" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/impact", label: "Impact" },
    { href: "/news", label: "News" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
              <CircleDot className="h-6 w-6" />
            </div>
            <span className="font-serif font-bold text-xl text-primary tracking-tight">
              Hockey Heart Initiative
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-secondary ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/donate"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold rounded-full px-6"
              )}
            >
              Donate Now
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="flex flex-col space-y-4 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/donate" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold rounded-full mt-2"
              )}
            >
              Donate Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
