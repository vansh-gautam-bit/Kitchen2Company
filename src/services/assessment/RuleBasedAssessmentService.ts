/* ═══════════════════════════════════════════════════════════════════ *
 *  Rule-Based Assessment Service                                   *
 *                                                                   *
 *  Extracts the deterministic rule-based logic from assessment.ts   *
 *  into a class implementing AssessmentService. Used as fallback    *
 *  when AI is unavailable and as the sync path for Dashboard and   *
 *  Roadmap backward compat.                                        *
 * ═══════════════════════════════════════════════════════════════════ */

import type {
  BusinessProfile,
  BusinessAssessment,
  BusinessStructure,
  Registration,
  NextBestAction,
  Resource,
} from "../../types/business";
import type { AssessmentService } from "./types";

/* ── Internal helpers ──────────────────────────────────────────── */

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

/* ── Business structure rules ──────────────────────────────────── */

interface StructureRule {
  name: string;
  tagline: string;
  description: string;
  pros: string[];
  iconName: string;
  explanation: string;
  match: (profile: BusinessProfile) => boolean;
}

const structureRules: StructureRule[] = [
  {
    name: "Sole Proprietorship",
    tagline: "Best for solo founders & small teams",
    description:
      "The simplest structure for solo and small food businesses. You and your business are one legal entity — minimal paperwork, full control, and no annual filing requirements beyond your income tax return. Ideal for testing your concept with low overhead.",
    pros: [
      "Minimal paperwork & cost",
      "Complete profit ownership",
      "Easy to wind up if needed",
    ],
    iconName: "User",
    explanation:
      "As a solo or small-team founder, a Sole Proprietorship gives you the fastest path to launch with the lowest administrative burden. You retain full control and all profits, and compliance is limited to income tax filing.",
    match: (p) =>
      (p.teamSize === "solo" || p.teamSize === "small") &&
      (!p.growthGoal ||
        p.growthGoal === "side-hustle" ||
        p.growthGoal === "full-time"),
  },
  {
    name: "Limited Liability Partnership (LLP)",
    tagline: "Best for growing teams with ambition",
    description:
      "An LLP combines the flexibility of a partnership with the protection of limited liability. Perfect for small teams with growth ambitions — you get separate legal identity, partner protection, and easier access to business banking and loans without the compliance overhead of a full company.",
    pros: [
      "Limited liability protection",
      "Flexible partner agreements",
      "Lower compliance than Pvt Ltd",
      "Separate legal identity",
    ],
    iconName: "Users",
    explanation:
      "Your team size and growth goals indicate you're ready to take the business seriously. An LLP gives you liability protection and a formal business identity while keeping compliance simpler — the sweet spot between a sole proprietorship and a full private limited company.",
    match: (p) =>
      (p.teamSize === "solo" || p.teamSize === "small") &&
      (p.growthGoal === "scale" ||
        p.growthGoal === "national-brand" ||
        p.growthGoal === "international"),
  },
  {
    name: "Limited Liability Partnership (LLP)",
    tagline: "Ideal for mid-size teams",
    description:
      "For teams of 4–6, an LLP provides the structure and credibility you need while keeping compliance manageable. Separate legal identity, partner protection, and lower annual filing costs make it attractive for food businesses expanding their operations.",
    pros: [
      "Partner liability protection",
      "Credible business identity",
      "Moderate compliance cost",
      "Flexible management structure",
    ],
    iconName: "Users",
    explanation:
      "With a mid-size team, you need formal structure without the heavy compliance of a private limited company. An LLP gives your team legal protection and your business the credibility to work with vendors and aggregators.",
    match: (p) => p.teamSize === "medium",
  },
  {
    name: "Private Limited Company (Pvt. Ltd.)",
    tagline: "Best for scaling food businesses",
    description:
      "The most credible structure for large-scale food businesses. Offers limited liability, seamless investor funding, institutional banking, ESOPs for employees, and the professional stature required for retail chains, institutional catering, and multi-location expansion.",
    pros: [
      "Unlimited growth potential",
      "Investor-ready structure",
      "Brand & IP protection",
      "Employee stock options",
      "Maximum credibility",
    ],
    iconName: "Building2",
    explanation:
      "Your team size puts you in growth territory. A Private Limited Company gives you the strongest legal foundation — investor-ready, brand-protected, and built for scale. The compliance is higher, but so is the ceiling.",
    match: (p) => p.teamSize === "large" || p.teamSize === "enterprise",
  },
];

function determineBusinessStructure(profile: BusinessProfile): {
  structure: BusinessStructure;
  explanation: string;
} {
  for (const rule of structureRules) {
    if (rule.match(profile)) {
      const { explanation, match: _m, ...structure } = rule;
      return { structure, explanation };
    }
  }

  return {
    structure: {
      name: "Sole Proprietorship",
      tagline: "The simplest way to get started",
      description:
        "Minimal paperwork, full control, and the fastest way to begin selling. Upgrade your structure as you grow.",
      pros: ["Zero registration cost", "Simple tax filing", "Full ownership"],
      iconName: "User",
    },
    explanation:
      "Based on your answers, we recommend starting with the simplest structure and upgrading as you grow. This keeps your upfront costs low while you validate your business.",
  };
}

/* ── Registrations ─────────────────────────────────────────────── */

function determineRegistrations(profile: BusinessProfile): Registration[] {
  const gstRequired = needsGST(profile);

  return [
    {
      id: "fssai",
      name: "FSSAI Registration",
      status: "Required",
      statusClass: "text-amber-700 bg-amber-50 border-amber-200",
      statusIconName: "Shield",
      description:
        "Food Safety & Standards Authority of India registration. Mandatory for every food business operator in India, from home kitchens to large manufacturers.",
      timeline: "7–14 business days",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      id: "udyam",
      name: "UDYAM Registration",
      status: "Recommended",
      statusClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
      statusIconName: "FileText",
      description:
        "MSME registration that unlocks government subsidies, priority sector lending, tax benefits, and easier access to credit for small food businesses.",
      timeline: "1–2 business days",
      gradient: "from-emerald-400 to-emerald-600",
    },
    {
      id: "gst",
      name: "GST Registration",
      status: gstRequired ? "Required" : "May be required",
      statusClass: gstRequired
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-blue-700 bg-blue-50 border-blue-200",
      statusIconName: gstRequired ? "AlertCircle" : "Clock",
      description:
        "Goods & Services Tax registration. Required if your annual turnover exceeds ₹40L (goods) or ₹20L (services). Most aggregator, retail, and online sales channels require GST compliance from day one.",
      timeline: "5–7 business days",
      gradient: "from-blue-400 to-indigo-500",
    },
  ];
}

/* ── Readiness score ────────────────────────────────────────────── */

function computeReadinessScore(profile: BusinessProfile): {
  score: number;
  message: string;
} {
  let score = 25;

  const highValueChannels = [
    "aggregators",
    "own-website",
    "retail",
    "corporate-catering",
    "multiple",
  ];
  score += highValueChannels.includes(profile.salesChannels) ? 12 : 8;

  const growthScores: Record<string, number> = {
    "side-hustle": 5,
    "full-time": 10,
    scale: 13,
    "national-brand": 15,
    international: 15,
  };
  score += growthScores[profile.growthGoal] ?? 5;

  const teamScores: Record<string, number> = {
    solo: 4,
    small: 7,
    medium: 10,
    large: 12,
    enterprise: 12,
  };
  score += teamScores[profile.teamSize] ?? 4;

  score += profile.kitchenType === "not-sure" ? 4 : 10;
  score += profile.businessType ? 8 : 0;
  score += profile.location ? 5 : 0;
  score += needsGST(profile) ? 5 : 3;

  const clamped = Math.min(98, Math.max(30, Math.round(score)));

  let message: string;
  if (clamped >= 85) {
    message =
      "You're well prepared to start your food business journey. Focus on executing the next best action below.";
  } else if (clamped >= 65) {
    message =
      "You're off to a great start! Complete the recommended registrations to move closer to launch day.";
  } else {
    message =
      "You're building a solid foundation. Use this dashboard as your checklist and tackle one registration at a time.";
  }

  return { score: clamped, message };
}

/* ── Next best action ──────────────────────────────────────────── */

function determineNextBestAction(profile: BusinessProfile): NextBestAction {
  if (needsGST(profile)) {
    return {
      title: "Register for GST first",
      description:
        "Since you plan to sell through aggregators, online platforms, or multiple channels, GST registration should be your first step. It's required for onboarding with Swiggy, Zomato, and most retail partners — without it, you can't go live on those platforms.",
    };
  }

  return {
    title: "Apply for FSSAI Registration",
    description:
      "FSSAI registration is the single most important step for any food business in India. It's a legal requirement, builds customer trust, and is your gateway to working with aggregators and retailers. Start your application online today.",
  };
}

/* ── Resources ─────────────────────────────────────────────────── */

function determineResources(_profile: BusinessProfile): Resource[] {
  return [
    {
      name: "FSSAI Official Portal",
      url: "https://fssai.gov.in",
      description:
        "Apply for food safety license, check guidelines, and track application status.",
    },
    {
      name: "UDYAM Registration Portal",
      url: "https://udyamregistration.gov.in",
      description:
        "Register your business as an MSME to access government schemes and subsidies.",
    },
    {
      name: "GST Portal",
      url: "https://gst.gov.in",
      description:
        "Register for GST, file returns, and manage compliance online.",
    },
  ];
}

/* ═══════════════════════════════════════════════════════════════════ *
 *  Service Implementation                                            *
 * ═══════════════════════════════════════════════════════════════════ */

export class RuleBasedAssessmentService implements AssessmentService {
  async generate(profile: BusinessProfile): Promise<BusinessAssessment> {
    return this.generateSync(profile);
  }

  /** Sync version for backward compat (Dashboard / Roadmap useMemo). */
  generateSync(profile: BusinessProfile): BusinessAssessment {
    const { structure, explanation } = determineBusinessStructure(profile);
    const { score, message } = computeReadinessScore(profile);

    return {
      recommendedBusinessStructure: structure,
      explanation,
      requiredRegistrations: determineRegistrations(profile),
      launchReadinessScore: score,
      readinessMessage: message,
      nextBestAction: determineNextBestAction(profile),
      resources: determineResources(profile),
    };
  }
}

/** Singleton instance for convenience. */
export const ruleBasedService = new RuleBasedAssessmentService();