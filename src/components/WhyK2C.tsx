import { X, Check } from "lucide-react";
import { SectionHeading } from "./ui";

const withoutItems = [
  "Unsure which licenses you need",
  "Hours of confusing government website research",
  "Missed deadlines & re-applications",
  "Hidden costs from trial & error",
];

const withItems = [
  "Clear, personalised compliance checklist",
  "AI-powered guidance in minutes, not days",
  "Step-by-step timeline with deadlines",
  "Transparent cost breakdowns upfront",
];

export default function WhyK2C() {
  return (
    <section id="why-k2c" className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Kitchen2Company"
          title="Don&#39;t go it alone"
          subtitle="Navigating food business compliance alone is overwhelming. Let us guide you through every step."
        />

        {/* Comparison cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Without */}
          <div className="rounded-3xl border-2 border-red-100 bg-red-50/40 p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <X size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-900">
                  Without Kitchen2Company
                </h3>
                <p className="text-sm text-red-700/70">
                  The DIY compliance struggle
                </p>
              </div>
            </div>
            <ul className="mt-8 space-y-5">
              {withoutItems.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                    <X size={14} />
                  </div>
                  <span className="text-base text-red-800/80">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With */}
          <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-8 lg:p-10 shadow-lg shadow-emerald-100/30 relative overflow-hidden">
            {/* Floating badge */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-200/30 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-emerald text-white">
                  <Check size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">
                    With Kitchen2Company
                  </h3>
                  <p className="text-sm text-emerald-700/70">
                    Guided every step of the way
                  </p>
                </div>
              </div>
              <ul className="mt-8 space-y-5">
                {withItems.map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-emerald-700">
                      <Check size={14} />
                    </div>
                    <span className="text-base text-emerald-900/80 font-medium">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}