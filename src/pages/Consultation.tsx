import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ── Question data ─────────────────────────────────────────────── */

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  label: string;
  question: string;
  why: string;
  options: Option[];
}

const questions: Question[] = [
  {
    id: "business-type",
    label: "Business Type",
    question: "What type of food business are you starting?",
    why: "This helps us determine the exact licenses, registrations, and business structure that fit your model.",
    options: [
      { value: "home-chef", label: "Home Chef Catering" },
      { value: "cloud-kitchen", label: "Cloud Kitchen" },
      { value: "food-truck", label: "Food Truck" },
      { value: "bakery", label: "Bakery & Confectionery" },
      { value: "meal-prep", label: "Meal Prep Service" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "location",
    label: "Location",
    question: "Which state will you operate from?",
    why: "Food safety rules, GST rates, and local permits vary significantly by state.",
    options: [
      { value: "maharashtra", label: "Maharashtra" },
      { value: "karnataka", label: "Karnataka" },
      { value: "tamil-nadu", label: "Tamil Nadu" },
      { value: "delhi-ncr", label: "Delhi NCR" },
      { value: "uttar-pradesh", label: "Uttar Pradesh" },
      { value: "gujarat", label: "Gujarat" },
      { value: "west-bengal", label: "West Bengal" },
      { value: "telangana", label: "Telangana" },
      { value: "kerala", label: "Kerala" },
      { value: "rajasthan", label: "Rajasthan" },
      { value: "other", label: "Other State" },
    ],
  },
  {
    id: "kitchen-type",
    label: "Kitchen Type",
    question: "What kitchen setup will you be using?",
    why: "Your kitchen type determines the FSSAI inspection requirements and hygiene compliance checklist.",
    options: [
      { value: "home-kitchen", label: "Home Kitchen" },
      { value: "rented-commercial", label: "Rented Commercial Kitchen" },
      { value: "cloud-kitchen-facility", label: "Cloud Kitchen Facility" },
      { value: "shared-commissary", label: "Shared Commissary Kitchen" },
      { value: "food-truck", label: "Food Truck" },
      { value: "not-sure", label: "Not Sure Yet" },
    ],
  },
  {
    id: "sales-channels",
    label: "Sales Channels",
    question: "How do you plan to sell your food?",
    why: "Your sales channels affect GST registration requirements, packaging, and label compliance.",
    options: [
      { value: "d2c", label: "Direct to Customers (D2C)" },
      { value: "aggregators", label: "Swiggy / Zomato" },
      { value: "own-website", label: "Own Website / App" },
      { value: "retail", label: "Retail Stores / Cafés" },
      { value: "corporate-catering", label: "Corporate Catering" },
      { value: "multiple", label: "Multiple Channels" },
    ],
  },
  {
    id: "team-size",
    label: "Team Size",
    question: "How many people will be working with you?",
    why: "Team size impacts your business structure choice and labour compliance obligations.",
    options: [
      { value: "solo", label: "Just Me" },
      { value: "small", label: "2–3 People" },
      { value: "medium", label: "4–6 People" },
      { value: "large", label: "7–10 People" },
      { value: "enterprise", label: "10+ People" },
    ],
  },
  {
    id: "growth-goals",
    label: "Growth Goals",
    question: "What's your vision for this business?",
    why: "Your ambition level shapes the right business registration, trademark, and funding strategy.",
    options: [
      { value: "side-hustle", label: "Side Hustle (₹5K–₹50K/month)" },
      { value: "full-time", label: "Full-Time Income (₹50K–₹2L/month)" },
      { value: "scale", label: "Scale to Multiple Locations" },
      { value: "national-brand", label: "Build a National Brand" },
      { value: "international", label: "Go International" },
    ],
  },
];

/* ── Animation variants ────────────────────────────────────────── */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

/* ── Helper: progress segments ─────────────────────────────────── */

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-500 ${
            i <= current
              ? "bg-emerald-500"
              : i === current + 1
                ? "bg-emerald-200/60"
                : "bg-gray-100"
          } ${i <= current ? "w-8" : "w-2.5"}`}
        />
      ))}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */

type Answers = Record<string, string>;

export default function Consultation() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [showSummary, setShowSummary] = useState(false);

  const totalSteps = questions.length;
  const current = questions[step];

  const selectAnswer = useCallback(
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [current.id]: value }));
    },
    [current.id],
  );

  const goNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      setDirection(1);
      setShowSummary(true);
    }
  }, [step, totalSteps]);

  const goBack = useCallback(() => {
    if (showSummary) {
      setDirection(-1);
      setShowSummary(false);
    } else if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step, showSummary]);

  const canProceed = answers[current.id] !== undefined && answers[current.id] !== "";

  const progress = ((step + 1) / totalSteps) * 100;

  /* ── Summary screen ──────────────────────────────────────────── */

  if (showSummary) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="mx-auto max-w-2xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Completion icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-emerald text-white">
                  <Check size={28} />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                You're all set!
              </h2>
              <p className="mt-4 text-lg text-text-muted max-w-lg mx-auto">
                Here's a summary of your consultation. Your personalised launch
                roadmap is being prepared.
              </p>
            </motion.div>

            {/* Summary cards */}
            <div className="mt-12 space-y-3">
              {questions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                  className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-warm px-6 py-4"
                >
                  <div>
                    <p className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
                      {q.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-text-primary">
                      {answers[q.id]
                        ? q.options.find((o) => o.value === answers[q.id])?.label ??
                          answers[q.id]
                        : "—"}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={16} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-200 bg-white px-8 py-3.5 text-base font-semibold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
              >
                <ArrowLeft size={18} />
                Review Answers
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-emerald px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:opacity-90"
              >
                Back to Home
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Question flow ───────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* ── Progress ────────────────────────────────────────── */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-600">
                Step {step + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-text-subtle">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3">
              <ProgressDots total={totalSteps} current={step} />
            </div>
          </div>

          {/* ── K2 Greeting (shown once on step 0) ──────────────── */}
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-8 flex items-center gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6"
            >
              {/* K2 Avatar */}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-emerald text-white animate-pulse-ring">
                <span className="relative z-10 text-lg font-bold">K2</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  Hi! I'm K2, your AI Launch Advisor.
                  <Sparkles size={18} className="text-emerald-500" />
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  I'll help you build a personalised launch roadmap. Just answer
                  a few quick questions — it only takes 2 minutes.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Question card ───────────────────────────────────── */}
          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Question header */}
                <div className="mb-2">
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                    {current.label}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                  {current.question}
                </h2>

                {/* Why this matters */}
                <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span>{current.why}</span>
                </p>

                {/* Quick reply chips */}
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {current.options.map((option, idx) => {
                    const selected = answers[current.id] === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.25 }}
                        onClick={() => selectAnswer(option.value)}
                        className={`group relative flex items-center rounded-2xl border-2 px-5 py-4 text-left text-base font-medium transition-all duration-200 ${
                          selected
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-100/40"
                            : "border-border-subtle bg-white text-text-primary hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
                        }`}
                      >
                        {/* Selected checkmark */}
                        <span
                          className={`mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                            selected
                              ? "bg-gradient-emerald text-white"
                              : "border-2 border-gray-200 group-hover:border-emerald-300"
                          }`}
                        >
                          {selected && <Check size={14} />}
                        </span>

                        <span className="flex-1">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Navigation ──────────────────────────────────────── */}
          <div className="mt-10 flex items-center justify-between border-t border-border-light pt-8">
            {/* Back */}
            <div>
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="inline-flex items-center gap-2 rounded-full border border-border-light bg-white px-6 py-3 text-sm font-semibold text-text-muted hover:border-emerald-200 hover:text-emerald-700 transition-all"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              )}
            </div>

            {/* Next / Finish */}
            <button
              onClick={goNext}
              disabled={!canProceed}
              className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all ${
                canProceed
                  ? "bg-gradient-emerald text-white shadow-lg hover:shadow-xl hover:opacity-90"
                  : "bg-gray-100 text-text-subtle cursor-not-allowed"
              }`}
            >
              {step < totalSteps - 1 ? (
                <>
                  Next
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  See My Summary
                  <Check size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}