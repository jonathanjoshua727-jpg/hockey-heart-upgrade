import { Link } from "wouter";
import { CircleDot, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal nav */}
      <nav className="border-b border-border py-4 px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-serif font-bold text-lg">
          <div className="bg-primary text-primary-foreground p-1 rounded-full">
            <CircleDot className="w-5 h-5" />
          </div>
          Hockey Heart Initiative
        </Link>
      </nav>

      {/* 404 */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-lg">
          <div className="space-y-2">
            <p className="font-serif text-8xl font-bold text-primary/20">404</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">
              Page Not Found
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The page you're looking for doesn't exist or may have been moved.
              Let's get you back on the ice.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-full font-semibold hover:bg-muted/40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { href: "/about", label: "About Us" },
                { href: "/campaigns", label: "Campaigns" },
                { href: "/donate", label: "Donate" },
                { href: "/news", label: "News" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-primary underline hover:text-primary/80 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
