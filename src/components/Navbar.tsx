import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#why-k2c" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-light/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-emerald text-white text-sm font-bold">
            K2
          </span>
          <span className="text-xl font-bold text-text-primary tracking-tight">
            Kitchen2Company
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-text-muted hover:text-emerald-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <a
            href="/consultation"
            className="inline-flex items-center rounded-full bg-gradient-emerald px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:opacity-90 transition-all"
          >
            Start My Business
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-text-muted hover:text-text-primary"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border-light bg-white px-6 pb-6 pt-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="block w-full text-left text-sm font-medium text-text-muted hover:text-emerald-600 transition-colors py-2"
            >
              {link.label}
            </button>
          ))}
          <a
            href="/consultation"
            className="block w-full text-center rounded-full bg-gradient-emerald px-5 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            Start My Business
          </a>
        </div>
      )}
    </nav>
  );
}