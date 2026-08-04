import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Shield,
  Sparkles,
  ChevronRight,
  User,
  Users,
  ArrowLeft,
  Map,
  Download,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import type { BusinessProfile, BusinessAssessment, Registration, Resource } from "../types/business";
import type { OfficialResource } from "../types/research";
import { useBusinessProfile } from "../context/BusinessContext";
import { generateAssessment } from "../services/assessment";
import { getResearchService } from "../services/research";
import { generateRoadmap } from "../services/roadmap";
import { downloadLaunchReport } from "../utils/downloadPDF";

/* ═══════════════════════════════════════════════════════════════ *
 *  UI COMPONENTS                                                  *
 * ═══════════════════════════════════════════════════════════════ */

/* ── Icon resolver ────────────────────────────────────── */

const ICON_MAP: Record<string, React.ElementType> = {
  User,
  Users,
  Building2,
  Shield,
  FileText,
  AlertCircle,
  Clock,
};

function resolveIcon(name?: string, fallback?: React.ElementType): React.ElementType {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return fallback ?? Shield;
}

/* ── Card wrapper ─────────────────────────────────────── */

function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`rounded-2xl border border-border-light bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Business Summary item ────────────────────────────── */

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-warm px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-text-subtle">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value || "—"}</p>
    </div>
  );
}

/* ── Circular Progress ────────────────────────────────── */

function CircularProgress({ percent, size = 120 }: { percent: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-2xl font-bold text-text-primary">{percent}%</span>
    </div>
  );
}

/* ── Registration Card ────────────────────────────────── */

function RegistrationCard(reg: Registration) {
  const StatusIcon = resolveIcon(reg.statusIconName, Clock);
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border-light bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${reg.gradient}`} />
      <div className="mt-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-bold text-text-primary">{reg.name}</h4>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${reg.statusClass}`}
          >
            <StatusIcon size={12} />
            {reg.status}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{reg.description}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-text-subtle">
          <Clock size={14} />
          <span>Est. {reg.timeline}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Resource Link ────────────────────────────────────── */

function ResourceLink({ name, url, description }: Resource) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-xl border border-border-light p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <ExternalLink size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-text-primary group-hover:text-emerald-700 transition-colors">
            {name}
          </span>
          <ChevronRight size={14} className="text-text-subtle group-hover:text-emerald-500 transition-colors" />
        </div>
        <p className="mt-0.5 text-xs text-text-muted">{description}</p>
      </div>
    </a>
  );
}

/* ── Loading skeleton for official resources ──────────── */

function ResourceSkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-3 rounded-xl border border-border-light p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-border-light" />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <div className="h-3.5 w-2/5 rounded bg-border-light" />
        <div className="h-3 w-4/5 rounded bg-border-light" />
      </div>
    </div>
  );
}

/* ── Resources error / empty state ────────────────────── */

function ResourceEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border-light p-6 text-center">
      <p className="text-sm font-medium text-text-primary">Unable to load resources</p>
      <p className="mt-1 text-xs text-text-muted">
        We couldn&apos;t fetch official portals right now. Check your connection and try again.
      </p>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────── */

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
              <Sparkles size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">No consultation data yet</h2>
          <p className="mt-3 text-text-muted leading-relaxed">
            Take the Founder Consultation first to generate your personalised launch
            dashboard with business structure, registrations, and next steps.
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

/* ═══════════════════════════════════════════════════════════════ *
 *  DASHBOARD COMPONENT                                            *
 *                                                                 *
 *  Consumes BOTH BusinessProfile AND BusinessAssessment.          *
 *  Profile  → "what the founder told us" (raw facts)              *
 *  Assessment → "what we recommend" (derived, replaceable by AI)  *
 *                                                                 *
 *  The assessment comes from context (set by Consultation) or     *
 *  route state.  If neither exists, we generate it on the fly as  *
 *  a fallback — so direct /dashboard?profile=… links still work.  *
 * ═══════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const location = useLocation();
  const { profile: contextProfile, assessment: contextAssessment } = useBusinessProfile();

  // Read from router state first, fall back to context
  const state = location.state as { profile?: BusinessProfile; assessment?: BusinessAssessment } | undefined;
  const profile: BusinessProfile | null = state?.profile ?? contextProfile ?? null;

  // Stabilise the fallback identity so the research effect (below) doesn't re-run on every render.
  const fallbackAssessment = useMemo(
    () => (profile ? generateAssessment(profile) : null),
    [profile],
  );
  const assessment: BusinessAssessment | null =
    state?.assessment ?? contextAssessment ?? fallbackAssessment;

  /* ── Official Resources (async via Research Service) ─── */

  const researchService = useMemo(() => getResearchService(), []);
  const [resources, setResources] = useState<OfficialResource[] | null>(null);

  useEffect(() => {
    if (!assessment) return;

    let cancelled = false;
    const controller = new AbortController();

    setResources(null); // enter loading state

    researchService
      .fetchOfficialResources(assessment, controller.signal)
      .then((result) => {
        if (!cancelled) setResources(result);
      })
      .catch((error) => {
        // AbortError is expected on unmount — silently ignore
        if (cancelled || (error instanceof DOMException && error.name === "AbortError")) return;
        if (!cancelled) setResources([]);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [assessment, researchService]);

  /* ── PDF download state & handler ─────────────────── */

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    if (!profile || !assessment) return;

    setPdfLoading(true);
    setPdfError(false);

    // Generate the roadmap data that will go into the PDF
    const roadmap = generateRoadmap(profile, assessment);

    const success = await downloadLaunchReport({
      profile,
      assessment,
      roadmapSteps: roadmap.steps,
      totalEstimatedDuration: roadmap.totalEstimatedDuration,
      resources: resources ?? [],
    });

    setPdfLoading(false);
    if (!success) setPdfError(true);

    // Auto-dismiss error after 8 seconds
    if (!success) {
      setTimeout(() => setPdfError(false), 8_000);
    }
  }, [profile, assessment, resources]);

  if (!profile || !assessment) {
    return <EmptyState />;
  }

  /* ── Summary field config ────────────────────────────── */

  const summaryFields: { label: string; value: string }[] = [
    { label: "Business Type", value: profile.businessTypeLabel },
    { label: "Location", value: profile.locationLabel },
    { label: "Kitchen Type", value: profile.kitchenTypeLabel },
    { label: "Sales Channels", value: profile.salesChannelsLabel },
    { label: "Team Size", value: profile.teamSizeLabel },
    { label: "Growth Goal", value: profile.growthGoalLabel },
  ];

  /* ── Structure icon ─────────────────────────────────── */

  const StructureIcon = resolveIcon(assessment.recommendedBusinessStructure.iconName, Building2);

  return (
    <div className="min-h-screen bg-bg-warm">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-emerald text-white shadow-lg">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                    Your Launch Dashboard
                  </h1>
                  <p className="mt-1 text-text-muted">
                    Your personalised launch roadmap — based on your consultation answers.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/roadmap"
                  state={{ profile, assessment }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-emerald px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:opacity-90 active:scale-[0.97]"
                >
                  <Map size={18} />
                  View My Launch Roadmap
                  <ArrowRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {pdfLoading ? "Generating PDF…" : "Download PDF"}
                </button>
              </div>
            </div>

            {/* ── PDF error banner ──────────────────── */}
            {pdfError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
              >
                <AlertTriangle size={18} className="shrink-0" />
                <span>
                  We couldn&apos;t generate your PDF right now. Please try again.
                </span>
                <button
                  type="button"
                  onClick={() => setPdfError(false)}
                  className="ml-auto shrink-0 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Row 1: Business Summary + Business Structure */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card delay={0.05}>
                <CardHeader icon={FileText} title="Business Summary" subtitle="Your consultation snapshot" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {summaryFields.map((field) => (
                    <SummaryItem key={field.label} label={field.label} value={field.value} />
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card delay={0.1}>
                <CardHeader
                  icon={StructureIcon}
                  title="Recommended Structure"
                  subtitle={assessment.recommendedBusinessStructure.tagline}
                />
                <h4 className="text-lg font-bold text-emerald-700">
                  {assessment.recommendedBusinessStructure.name}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {assessment.recommendedBusinessStructure.description}
                </p>

                {/* Why this structure — the explanation */}
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Why this structure?
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                    {assessment.explanation}
                  </p>
                </div>

                <ul className="mt-4 space-y-2">
                  {assessment.recommendedBusinessStructure.pros.map((pro) => (
                    <li key={pro} className="flex items-start gap-2 text-sm text-text-primary">
                      <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Row 2: Required Registrations */}
          <div className="mt-6">
            <Card delay={0.15}>
              <CardHeader icon={Shield} title="Required Registrations" subtitle="Legal & compliance checklist for your food business" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assessment.requiredRegistrations.map((reg) => (
                  <RegistrationCard key={reg.id} {...reg} />
                ))}
              </div>
            </Card>
          </div>

          {/* Row 3: Readiness + Next Action + Resources */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card delay={0.2}>
              <CardHeader icon={Sparkles} title="Launch Readiness" />
              <div className="flex flex-col items-center py-4">
                <CircularProgress percent={assessment.launchReadinessScore} />
                <p className="mt-4 text-center text-sm leading-relaxed text-text-muted">
                  {assessment.readinessMessage}
                </p>
              </div>
            </Card>

            <Card delay={0.25}>
              <CardHeader icon={ArrowRight} title="Next Best Action" />
              <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-emerald text-white shadow-sm">
                    <Check size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-emerald-800">{assessment.nextBestAction.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-emerald-700/80">
                      {assessment.nextBestAction.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card delay={0.3}>
              <CardHeader icon={ExternalLink} title="Official Resources" subtitle="Government portals" />
              <div className="space-y-3">
                {resources === null ? (
                  <>
                    <ResourceSkeleton />
                    <ResourceSkeleton />
                    <ResourceSkeleton />
                  </>
                ) : resources.length === 0 ? (
                  <ResourceEmptyState />
                ) : (
                  resources.map((r) => (
                    <ResourceLink key={r.id} name={r.name} url={r.url} description={r.description} />
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <Link
              to="/consultation"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Consultation
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}