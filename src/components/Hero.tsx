import { ArrowRight, Play } from "lucide-react";
import { Button, Badge } from "./ui";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white pt-16">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-2 w-2 rounded-full bg-emerald-400/40" />
        <div className="absolute top-1/2 right-1/3 h-3 w-3 rounded-full bg-emerald-300/40" />
        <div className="absolute bottom-1/4 right-1/4 h-1.5 w-1.5 rounded-full bg-emerald-500/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge dot variant="default" className="mb-8 text-sm font-medium px-4 py-1.5">
            India&#39;s #1 Food Business Launch Platform
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
            Turn Your Home Kitchen{" "}
            <span className="text-gradient-emerald">Into a Legal Business.</span>
          </h1>

          {/* Supporting text */}
          <p className="mx-auto mt-8 max-w-3xl text-lg sm:text-xl text-text-muted leading-relaxed">
            Kitchen2Company helps aspiring food entrepreneurs in India navigate
            registrations, choose the right business structure, and receive a
            personalized launch roadmap — all through one AI-powered
            consultation.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button as="a" href="/consultation" size="lg">
              Start My Business
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="secondary" size="lg">
              <Play size={20} className="fill-emerald-700" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Trusted by / social proof */}
        <div className="mt-20 text-center">
          <p className="text-sm font-medium text-text-subtle uppercase tracking-wider">
            Trusted by food entrepreneurs across India
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["Home Chefs", "Cloud Kitchens", "Food Trucks", "Bakers", "Caterers"].map(
              (item) => (
                <span
                  key={item}
                  className="text-sm font-semibold text-text-muted/60 tracking-wide"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}