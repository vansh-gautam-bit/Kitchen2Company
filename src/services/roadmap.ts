/* ═══════════════════════════════════════════════════════════════════ *
 *  Launch Roadmap Engine                                            *
 *                                                                   *
 *  Transforms a BusinessProfile + BusinessAssessment into an        *
 *  ordered list of RoadmapStep items using deterministic rules.     *
 *                                                                   *
 *  REPLACEMENT PATH: When switching to Bright Data (live data)     *
 *  or an AI model, swap the body of generateRoadmap(). The         *
 *  function signature and Roadmap / RoadmapStep types remain       *
 *  unchanged — no consumer (Page, Dashboard) needs modification.   *
 * ═══════════════════════════════════════════════════════════════════ */

import type { BusinessProfile, BusinessAssessment } from "../types/business";
import type { Roadmap, RoadmapStep, StepStatus } from "../types/roadmap";

/* ── Internal helpers ──────────────────────────────────────────── */

function usesAggregators(profile: BusinessProfile): boolean {
  const channel = profile.salesChannels;
  return channel === "aggregators" || channel === "multiple";
}

function needsGST(profile: BusinessProfile): boolean {
  const channel = profile.salesChannels;
  const goal = profile.growthGoal;

  const gstRequiredChannels = [
    "aggregators",
    "own-website",
    "retail",
    "multiple",
    "corporate-catering",
  ];

  const scalingGoals = ["scale", "national-brand", "international"];

  return (
    !!(channel && gstRequiredChannels.includes(channel)) ||
    !!(goal && scalingGoals.includes(goal))
  );
}

function isScaling(profile: BusinessProfile): boolean {
  return (
    profile.growthGoal === "scale" ||
    profile.growthGoal === "national-brand" ||
    profile.growthGoal === "international"
  );
}

/* ── Determine step statuses based on assessment ──────────────── */

function determineStatuses(
  profile: BusinessProfile,
  assessment: BusinessAssessment,
): Record<string, StepStatus> {
  const statuses: Record<string, StepStatus> = {};

  // Step 1: Consultation is always complete (we have a profile)
  statuses["consultation"] = "completed";

  // Step 2: FSSAI — always required. If score is high enough, mark in-progress
  statuses["fssai"] =
    assessment.launchReadinessScore >= 70 ? "in-progress" : "pending";

  // Step 3: UDYAM — always recommended
  statuses["udyam"] =
    assessment.launchReadinessScore >= 60 ? "in-progress" : "pending";

  // Step 4: GST — conditional
  statuses["gst"] = needsGST(profile) ? "in-progress" : "pending";

  // Step 5: Business Banking
  statuses["banking"] = profile.teamSize !== "solo" ? "in-progress" : "pending";

  // Step 6: Insurance
  statuses["insurance"] = isScaling(profile) ? "in-progress" : "pending";

  // Step 7: Aggregator Onboarding
  statuses["aggregator"] = usesAggregators(profile) ? "pending" : "pending";

  // Step 8: Kitchen Ops
  statuses["kitchen"] = "pending";

  // Step 9: Brand & Marketing
  statuses["marketing"] = "pending";

  // Step 10: Go Live
  statuses["go-live"] = "pending";

  return statuses;
}

/* ── Build ordered steps ──────────────────────────────────────── */

function buildSteps(
  profile: BusinessProfile,
  assessment: BusinessAssessment,
): RoadmapStep[] {
  const status = determineStatuses(profile, assessment);

  const steps: Omit<RoadmapStep, "stepNumber">[] = [
    {
      id: "consultation",
      title: "Complete Founder Consultation",
      description:
        "Review and confirm your consultation answers. Your personalised launch plan is built on the business type, location, kitchen setup, and goals you shared during the consultation.",
      estimatedDuration: "Completed",
      status: status["consultation"],
      whyThisMatters:
        "Your answers shape every recommendation that follows — from which licences you need to which aggregators suit your cuisine. Getting this right ensures a smooth launch.",
    },
    {
      id: "fssai",
      title: "Apply for FSSAI Registration",
      description:
        "Submit your FSSAI application on the official portal with your business details, address proof, and food safety checklist. Basic registration is free; state-level licence has a nominal fee.",
      estimatedDuration: "7–14 business days",
      status: status["fssai"],
      whyThisMatters:
        "FSSAI registration is legally mandatory for every food business in India. Without it you cannot operate, cannot list on aggregators, and risk fines or closure. It also builds customer trust — your FSSAI number signals you're a legitimate business.",
    },
    {
      id: "udyam",
      title: "Register as MSME (UDYAM)",
      description:
        "Register your business on the UDYAM portal using your Aadhaar and business details. The process is fully online and free.",
      estimatedDuration: "1–2 business days",
      status: status["udyam"],
      whyThisMatters:
        "MSME registration unlocks government subsidies, priority-sector lending, lower interest rates on business loans, and tax benefits. Many aggregator and retail partners also prefer working with registered MSMEs.",
    },
    {
      id: "gst",
      title: needsGST(profile)
        ? "Register for GST"
        : "Evaluate GST Requirement",
      description: needsGST(profile)
        ? "Apply for GST registration on the GST portal. You'll need your PAN, Aadhaar, business address proof, and bank details. Registration is online and typically processed within a week."
        : "Monitor your turnover — GST registration becomes mandatory once annual turnover exceeds ₹40L (goods) or ₹20L (services). Many aggregators require GST even below this threshold.",
      estimatedDuration: needsGST(profile)
        ? "5–7 business days"
        : "Monitor quarterly",
      status: status["gst"],
      whyThisMatters:
        "GST compliance is non-negotiable for scaling food businesses. It enables input tax credit, is required by most B2B partners and aggregators, and prepares you for growth beyond the threshold.",
    },
    {
      id: "banking",
      title: "Set Up Business Banking",
      description:
        "Open a dedicated current account for your food business using your registration certificates (FSSAI, GST, UDYAM). Most Indian banks offer MSME-specific accounts with low minimum balances.",
      estimatedDuration: "3–5 business days",
      status: status["banking"],
      whyThisMatters:
        "Separating personal and business finances is critical for tax compliance, liability protection, and professional credibility. It also makes bookkeeping and GST filing vastly simpler.",
    },
    {
      id: "insurance",
      title: "Get Business Insurance",
      description:
        "Purchase a comprehensive business insurance policy covering public liability, product liability, kitchen equipment, and stock. Many insurers offer tailored policies for food businesses.",
      estimatedDuration: "2–5 business days",
      status: status["insurance"],
      whyThisMatters:
        "Insurance protects you against customer claims, kitchen accidents, and supply chain disruptions. Aggregators and retail partners often require proof of insurance before onboarding.",
    },
    {
      id: "aggregator",
      title: "Onboard with Aggregators",
      description: usesAggregators(profile)
        ? "Create merchant accounts on Swiggy, Zomato, and other platforms. You'll need your FSSAI licence, GST certificate (if applicable), menu details, kitchen photos, and bank account for payouts."
        : "Consider listing on aggregators to expand your reach. Even if you focus on direct sales, a limited aggregator presence can drive discovery and weekday orders.",
      estimatedDuration: "1–3 weeks",
      status: status["aggregator"],
      whyThisMatters:
        "Aggregators are the primary discovery channel for food businesses in India. Listing on even one platform can multiply your daily orders and give you data on customer preferences in your area.",
    },
    {
      id: "kitchen",
      title: "Set Up Kitchen Operations",
      description:
        "Finalise your kitchen workflow, ingredient sourcing, packaging, and portion standardisation. Create standard operating procedures (SOPs) for consistency and efficiency during peak hours.",
      estimatedDuration: "1–2 weeks",
      status: status["kitchen"],
      whyThisMatters:
        "A well-organised kitchen is the backbone of your business. Consistent quality, efficient prep, and reliable packaging directly impact customer retention and ratings.",
    },
    {
      id: "marketing",
      title: "Launch Marketing & Branding",
      description:
        "Set up social media profiles, create a simple website or menu page, design your logo and packaging, and plan your launch campaign. Leverage local SEO and food blogger outreach for organic reach.",
      estimatedDuration: "1–3 weeks",
      status: status["marketing"],
      whyThisMatters:
        "Great food doesn't sell itself — especially in a crowded market. A strong brand identity and targeted marketing ensure your launch creates buzz and attracts your first customers.",
    },
    {
      id: "go-live",
      title: "Go Live & Take First Orders",
      description:
        "Activate your aggregator listings, launch your website, announce on social media, and start accepting orders. Monitor early feedback closely and iterate on your menu, pricing, and delivery experience.",
      estimatedDuration: "Launch day",
      status: status["go-live"],
      whyThisMatters:
        "This is the moment everything comes together. Your first orders validate your concept, operations, and customer experience. Each order is data — use it to refine and grow.",
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
  }));
}

/* ── Compute total duration ───────────────────────────────────── */

function computeTotalDuration(profile: BusinessProfile): string {
  const hasAggregators = usesAggregators(profile);

  // Base estimate: minimum timeline with parallel work possible
  const baseWeeks = hasAggregators ? 6 : 4;
  const maxWeeks = hasAggregators ? 12 : 8;

  return `${baseWeeks}–${maxWeeks} weeks`;
}

/* ═══════════════════════════════════════════════════════════════════ *
 *  PUBLIC API                                                       *
 *                                                                    *
 *  This is the ONLY function consumers import. When switching to    *
 *  a live-data provider (e.g. Bright Data) or AI model, replace     *
 *  the body — the signature stays the same:                         *
 *                                                                    *
 *    (profile: BusinessProfile, assessment: BusinessAssessment)     *
 *      => Roadmap                                                   *
 *                                                                    *
 *  Async variant (for API calls):                                   *
 *    (profile: BusinessProfile, assessment: BusinessAssessment)     *
 *      => Promise<Roadmap>                                          *
 * ═══════════════════════════════════════════════════════════════════ */

export function generateRoadmap(
  profile: BusinessProfile,
  assessment: BusinessAssessment,
): Roadmap {
  return {
    steps: buildSteps(profile, assessment),
    totalEstimatedDuration: computeTotalDuration(profile),
  };
}