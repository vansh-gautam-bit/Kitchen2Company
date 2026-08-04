import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-emerald">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white text-sm font-bold">
                K2
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                Kitchen2Company
              </span>
            </a>
            <p className="mt-4 text-sm text-emerald-100/80 leading-relaxed max-w-sm">
              Helping aspiring food entrepreneurs in India navigate registrations,
              choose the right business structure, and launch with confidence.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Features", href: "#why-k2c" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "FAQ", href: "#faq" },
                { label: "Start My Business", href: "/consultation" },
              ].map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("#") ? (
                    <button
                      onClick={() => {
                        const el = document.querySelector(link.href);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-sm text-emerald-100/80 hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-emerald-100/80 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Business types */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              For
            </h4>
            <ul className="mt-4 space-y-3">
              {[
                "Home Chefs",
                "Cloud Kitchens",
                "Food Trucks",
                "Bakers",
                "Caterers",
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm text-emerald-100/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-emerald-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-emerald-100/60">
            &copy; {new Date().getFullYear()} Kitchen2Company. All rights reserved.
          </p>
          <p className="text-sm text-emerald-100/60 flex items-center gap-1">
            Made with <Heart size={14} className="text-emerald-300" /> for India&#39;s food entrepreneurs
          </p>
        </div>
      </div>
    </footer>
  );
}