import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  ArrowLeft,
  ArrowRight,
  Map,
  ChevronDown,
  ListChecks,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import type { BusinessProfile, BusinessAssessment } from "../types/business";
import type { RoadmapStep } from "../types/roadmap";
import { useBusinessProfile } from "../context/BusinessContext";
import { generateAssessment } from "../services/assessment";
import { generateRoadmap } from "../services/roadmap";

/* ═══════════════════════════════════════════════════════════════════ *
 *  TIMELINE COMPONENT                                                *
 * ═══════════════════════════════════════════════════════════════════ */

const STATUS_ICONS: Record<string, React.ElementType> = {
  completed: Check,
  "in-progress": Clock,
  pending: Clock,
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  pending: "Pending",
};

function TimelineStep({
  step,
  index,
}: {
  step: RoadmapStep;
  index: number;
}) {
  const StatusIcon = STATUS_ICONS[step.status] ?? Clock;
  const isCompleted = step.status === "completed";
  const isInProgress = step.status === "in-progress";
  const isPending = step.status === "pending";

  /* ── Connector line classes ───────────────────── */
  const connectorTop = index === 0 ? "top-6" : "top-0";
  const connectorBottom = "bottom-0";
  const connectorColor = isCompleted ? "bg-emerald-400" : "bg-border-light";

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      className="relative flex gap-6 pb-12 last:pb-0"
    >
      {/* ── Timeline column ─────────────────────── */}
      <div className="relative flex w-8 shrink-0 flex-col items-center">
        {/* Connector line (top → dot → bottom) */}
        <div
          className={`absolute ${connectorTop} ${connectorBottom} w-0.5 ${connectorColor}`}
        />

        {/* Status dot */}
        <div
          className={`relative z-10 mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
              : isInProgress
                ? "border-emerald-400 bg-white text-emerald-600 shadow-sm"
                : "border-border-light bg-white text-text-subtle"
          }`}
        >
          {isCompleted ? (
            <Check size={14} strokeWidth={3} />
          ) : (
            <span>{step.stepNumber}</span>
          )}
        </div>
      </div>

      {/* ── Content column ─────────────────────── */}
      <div className="min-w-0 flex-1 pt-1">
        <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm transition-all hover:shadow-md">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-base font-bold text-text-primary">
              {step.title}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : isInProgress
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-border-light bg-bg-warm text-text-subtle"
              }`}
            >
              <StatusIcon size={12} />
              {STATUS_LABELS[step.status] ?? step.status}
            </span>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {step.description}
          </p>

          {/* Footer: duration + why it matters */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-subtle">
              <Clock size={14} />
              <span>{step.estimatedDuration}</span>
            </div>

            {isPending && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-subtle">
                <ChevronDown size={14} />
                <span>Up next</span>
              </div>
            )}
          </div>

          {/* Why this matters (expandable) — always visible on roadmap */}
          <details className="group mt-3">
            <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors">
              <ChevronDown
                size={14}
                className="transition-transform group-open:rotate-180"
              />
              Why this step matters
            </summary>
            <p className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm leading-relaxed text-emerald-800">
              {step.whyThisMatters}
            </p>
          </details>
        </div>
      </div>
    </motion.li>
  );
}

/* ── Sparkline progress bar ──────────────────────────────────── */

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-medium text-text-muted">
        <span>Progress</span>
        <span>{percent}% complete</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border-light">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ *
 *  EMPTY STATE                                                      *
 * ═══════════════════════════════════════════════════════════════════ */

function EmptyState() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex items-center justify-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg px-6 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-emerald text-white">
              <Map size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            No launch roadmap yet
          </h2>
          <p className="mt-3 text-text-muted leading-relaxed">
            Complete the Founder Consultation first to generate your
            personalised launch roadmap with step-by-step guidance.
          </p>
          <Link
            to="/consultation"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-emerald px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:opacity-90"
          >
            Start Consultation
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ *
 *  ROADMAP PAGE                                                      *
 * ═══════════════════════════════════════════════════════════════════ */

export default function Roadmap() {
  const location = useLocation();
  const { profile: contextProfile, assessment: contextAssessment } =
    useBusinessProfile();

  // Read from router state first, fall back to context
  const state = location.state as
    | { profile?: BusinessProfile; assessment?: BusinessAssessment }
    | undefined;
  const profile: BusinessProfile | null =
    state?.profile ?? contextProfile ?? null;

  const fallbackAssessment = useMemo(
    () => (profile ? generateAssessment(profile) : null),
    [profile],
  );
  const assessment: BusinessAssessment | null =
    state?.assessment ?? contextAssessment ?? fallbackAssessment;

  // Generate roadmap whenever profile + assessment are available
  const roadmap = useMemo(() => {
    if (!profile || !assessment) return null;
    return generateRoadmap(profile, assessment);
  }, [profile, assessment]);

  // Compute progress
  const progress = useMemo(() => {
    if (!roadmap || roadmap.steps.length === 0) return 0;
    const completed = roadmap.steps.filter(
      (s) => s.status === "completed" || s.status === "in-progress",
    ).length;
    return Math.round((completed / roadmap.steps.length) * 100);
  }, [roadmap]);

  if (!profile || !assessment || !roadmap) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-bg-warm">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* ── Page header ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-emerald text-white shadow-lg">
                <Map size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                  Your Launch Roadmap
                </h1>
                <p className="mt-1 text-text-muted">
                  {roadmap.steps.length} steps to launch your{" "}
                  {profile.businessTypeLabel.toLowerCase()} business &middot;
                  Est. {roadmap.totalEstimatedDuration}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <ProgressBar percent={progress} />
            </div>
          </motion.div>

          {/* ── Timeline ────────────────────────── */}
          <section aria-label="Launch roadmap steps">
            <ol className="relative">
              {roadmap.steps.map((step, index) => (
                <TimelineStep key={step.id} step={step} index={index} />
              ))}
            </ol>
          </section>

          {/* ── Summary card ────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-10"
          >
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-emerald text-white shadow-sm">
                <ListChecks size={22} />
              </div>
              <h3 className="text-lg font-bold text-emerald-800">
                Estimated time to launch: {roadmap.totalEstimatedDuration}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-700/80">
                Many steps can be completed in parallel. Focus on the next
                action — we&apos;ll guide you through each one.
              </p>
            </div>
          </motion.div>

          {/* ── Navigation links ────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <Link
              to="/consultation"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-emerald-600 transition-colors"
            >
              Revise Answers
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}