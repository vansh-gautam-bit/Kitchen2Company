/* ═══════════════════════════════════════════════════════════════════ *
 *  Rule-Based Assessment Service                                   *
 *                                                                   *
 *  Extracts deterministic rule-based logic from profile data.      *
 *  Used as fallback when AI is unavailable and as the sync path    *
 *  for Dashboard and Roadmap backward compat.                      *
 *                                                                   *
 *  v2 improvements:                                                *
 *  - Dynamic readiness score based on all profile factors          *
 *  - Personalized registrations based on business type, state, etc.*
 *  - Dynamic next best action                                      *
 *  - AI confidence estimation                                      *
 *  - Location-aware government resources                           *
 *  - Estimated timeline & compliance cost                          *
 *  - Reasoning summary connecting profile to recommendations       *
 * ═══════════════════════════════════════════════════════════════════ */

import type {
  BusinessProfile,
  BusinessAssessment,
  BusinessStructure,
  Registration,
  NextBestAction,
  Resource,
  AiConfidence,
} from "../../types/business";
import type { AssessmentService } from "./types";

/* ═══════════════════════════════════════════════════════════════════ *
 *  PROFILE ANALYZERS                                                *
 * ═══════════════════════════════════════════════════════════════════ */

function usesAggregators(profile: BusinessProfile): boolean {
  const channel = profile.salesChannels;
  return channel === "aggregators" || channel === "multiple";
}

function needsGST(profile: BusinessProfile): boolean {
  const channel = profile.salesChannels;
  const goal = profile.growthGoal;
  const gstChannels = ["aggregators", "own-website", "retail", "multiple", "corporate-catering"];
  const scalingGoals = ["scale", "national-brand", "international"];
  return !!(channel && gstChannels.includes(channel)) || !!(goal && scalingGoals.includes(goal));
}

function isScaling(profile: BusinessProfile): boolean {
  return ["scale", "national-brand", "international"].includes(profile.growthGoal);
}

function isCorporateCatering(profile: BusinessProfile): boolean {
  return profile.salesChannels === "corporate-catering";
}

function isRetail(profile: BusinessProfile): boolean {
  return profile.salesChannels === "retail";
}

function isOwnWebsite(profile: BusinessProfile): boolean {
  return profile.salesChannels === "own-website";
}

function isBakery(profile: BusinessProfile): boolean {
  return profile.businessType === "bakery";
}

function isCloudKitchen(profile: BusinessProfile): boolean {
  return profile.businessType === "cloud-kitchen";
}

function isFoodTruck(profile: BusinessProfile): boolean {
  return profile.businessType === "food-truck";
}

function isMealPrep(profile: BusinessProfile): boolean {
  return profile.businessType === "meal-prep";
}

function isHomeChef(profile: BusinessProfile): boolean {
  return profile.businessType === "home-chef";
}

function hasHomeKitchen(profile: BusinessProfile): boolean {
  return profile.kitchenType === "home-kitchen";
}

function hasCommercialKitchen(profile: BusinessProfile): boolean {
  return profile.kitchenType === "commercial" || profile.kitchenType === "rented-commercial";
}

function kitchenIsUnknown(profile: BusinessProfile): boolean {
  return !profile.kitchenType || profile.kitchenType === "not-sure" || profile.kitchenType === "";
}

function isSolo(profile: BusinessProfile): boolean {
  return profile.teamSize === "solo";
}

function hasLargeTeam(profile: BusinessProfile): boolean {
  return profile.teamSize === "large" || profile.teamSize === "enterprise";
}

function hasMediumTeam(profile: BusinessProfile): boolean {
  return profile.teamSize === "medium";
}

function isInternationalGoal(profile: BusinessProfile): boolean {
  return profile.growthGoal === "international";
}

function isNationalBrand(profile: BusinessProfile): boolean {
  return profile.growthGoal === "national-brand";
}

/* ═══════════════════════════════════════════════════════════════════ *
 *  LOCATION ANALYZERS (state-aware resources)                       *
 * ═══════════════════════════════════════════════════════════════════ */

interface StatePortal {
  state: string;
  localAuthority: string;
  portalUrl: string;
  portalName: string;
  description: string;
}

const STATE_PORTALS: StatePortal[] = [
  {
    state: "delhi",
    localAuthority: "MCD",
    portalUrl: "https://mcdonline.nic.in",
    portalName: "Delhi MCD (Trade License)",
    description: "Apply for trade license, health trade license, and food establishment registration in Delhi.",
  },
  {
    state: "kerala",
    localAuthority: "LSGD",
    portalUrl: "https://lsgkerala.gov.in",
    portalName: "Kerala Local Self Government",
    description: "Apply for trade license and health permits through Kerala LSGD portal.",
  },
  {
    state: "kerala",
    localAuthority: "Fire & Rescue",
    portalUrl: "https://fire.kerala.gov.in",
    portalName: "Kerala Fire & Rescue Services",
    description: "Apply for NOC from Kerala Fire & Rescue Services for commercial food establishments.",
  },
  {
    state: "karnataka",
    localAuthority: "BBMP",
    portalUrl: "https://bbmp.gov.in",
    portalName: "BBMP (Bengaluru)",
    description: "Apply for trade license, health license, and food safety registration in Bengaluru.",
  },
  {
    state: "karnataka",
    localAuthority: "Karnataka Fire",
    portalUrl: "https://karnatakafire.com",
    portalName: "Karnataka Fire Department",
    description: "Apply for fire NOC for commercial food establishments in Karnataka.",
  },
  {
    state: "maharashtra",
    localAuthority: "MCGM",
    portalUrl: "https://portal.mcgm.gov.in",
    portalName: "MCGM (Mumbai)",
    description: "Apply for trade license, eating house license, and health registration in Mumbai.",
  },
  {
    state: "maharashtra",
    localAuthority: "PCMC",
    portalUrl: "https://www.pcmcindia.gov.in",
    portalName: "PCMC (Pune)",
    description: "Apply for trade license and food business registration in Pune region.",
  },
  {
    state: "tamil-nadu",
    localAuthority: "TN Corporation",
    portalUrl: "https://tnurban.tn.gov.in",
    portalName: "Tamil Nadu Urban Local Bodies",
    description: "Apply for trade license and health license in Tamil Nadu urban areas.",
  },
  {
    state: "tamil-nadu",
    localAuthority: "Tamil Nadu Fire",
    portalUrl: "https://www.tnfrs.tn.gov.in",
    portalName: "Tamil Nadu Fire & Rescue",
    description: "Apply for fire NOC for food establishments in Tamil Nadu.",
  },
  {
    state: "uttar-pradesh",
    localAuthority: "UP Nagar Nigam",
    portalUrl: "https://nagarnigam.up.nic.in",
    portalName: "UP Nagar Nigam",
    description: "Apply for trade license and health permits in Uttar Pradesh municipal areas.",
  },
  {
    state: "west-bengal",
    localAuthority: "KMC",
    portalUrl: "https://www.kmcgov.in",
    portalName: "Kolkata Municipal Corporation",
    description: "Apply for trade license and food registration in Kolkata.",
  },
  {
    state: "gujarat",
    localAuthority: "AMC",
    portalUrl: "https://ahmedabadcity.gov.in",
    portalName: "Ahmedabad Municipal Corporation",
    description: "Apply for trade license and food establishment registration in Ahmedabad.",
  },
  {
    state: "telangana",
    localAuthority: "GHMC",
    portalUrl: "https://www.ghmc.gov.in",
    portalName: "GHMC (Hyderabad)",
    description: "Apply for trade license and health registration in Hyderabad.",
  },
  {
    state: "rajasthan",
    localAuthority: "Jaipur Municipal",
    portalUrl: "https://jaipurmc.org",
    portalName: "Jaipur Municipal Corporation",
    description: "Apply for trade license in Jaipur and Rajasthan urban areas.",
  },
];

function getStateFromLocation(locationValue: string): string {
  if (!locationValue) return "";
  const location = locationValue.toLowerCase();
  const statePrefixes = [
    "delhi", "kerala", "karnataka", "maharashtra",
    "tamil-nadu", "uttar-pradesh", "west-bengal",
    "gujarat", "telangana", "rajasthan", "haryana",
    "punjab", "madhya-pradesh", "andhra-pradesh",
    "odisha", "bihar", "jharkhand", "assam",
    "chhattisgarh", "goa", "himachal", "uttarakhand",
    "chandigarh", "puducherry",
  ];
  for (const state of statePrefixes) {
    if (location.startsWith(state)) return state;
  }
  return location;
}

function getLocalPortalsForState(state: string): StatePortal[] {
  return STATE_PORTALS.filter(p => p.state === state);
}

function getLocationDisplayName(state: string): string {
  const names: Record<string, string> = {
    "delhi": "Delhi", "kerala": "Kerala", "karnataka": "Karnataka",
    "maharashtra": "Maharashtra", "tamil-nadu": "Tamil Nadu",
    "uttar-pradesh": "Uttar Pradesh", "west-bengal": "West Bengal",
    "gujarat": "Gujarat", "telangana": "Telangana", "rajasthan": "Rajasthan",
    "haryana": "Haryana", "punjab": "Punjab", "madhya-pradesh": "Madhya Pradesh",
    "andhra-pradesh": "Andhra Pradesh", "odisha": "Odisha", "bihar": "Bihar",
    "jharkhand": "Jharkhand", "assam": "Assam", "chhattisgarh": "Chhattisgarh",
    "goa": "Goa", "himachal": "Himachal Pradesh", "uttarakhand": "Uttarakhand",
    "chandigarh": "Chandigarh", "puducherry": "Puducherry",
  };
  return names[state] || (state.charAt(0).toUpperCase() + state.slice(1).replace(/-/g, " "));
}

/* ── Business structure rules ──────────────────────────────────── */

interface StructureRule {
  name: string;
  tagline: string;
  description: string;
  pros: string[];
  iconName: string;
  explanationBullets: string[];
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
      "No annual ROC compliance",
    ],
    iconName: "User",
    explanationBullets: [
      "Team size of 1 — sole proprietorship is the most practical structure for solo founders",
      "Growth goal is local or part-time — no need for a complex entity at this stage",
      "Home kitchen setup works perfectly with sole proprietorship for FSSAI Basic registration",
      "No external funding planned — sole proprietorship keeps full ownership and control",
    ],
    match: (p) =>
      (p.teamSize === "solo" || p.teamSize === "small") &&
      (!p.growthGoal || p.growthGoal === "side-hustle" || p.growthGoal === "full-time"),
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
      "Easy to add new partners",
    ],
    iconName: "Users",
    explanationBullets: [
      "Team size of 1–3 with growth ambition — LLP supports expansion without heavy compliance",
      "Growth goal targets scaling or national presence — LLP gives credibility for aggregator partnerships",
      "Multiple sales channels planned — LLP provides the legal identity needed for multi-channel operations",
      "Limited liability protects personal assets as the business grows and takes on more risk",
    ],
    match: (p) =>
      (p.teamSize === "solo" || p.teamSize === "small") &&
      (p.growthGoal === "scale" || p.growthGoal === "national-brand" || p.growthGoal === "international"),
  },
  {
    name: "Limited Liability Partnership (LLP)",
    tagline: "Ideal for mid-size teams",
    description:
      "For teams of 4–6, an LLP provides the structure and credibility you need while keeping compliance manageable. Separate legal identity, partner protection, and lower annual filing costs make it attractive for food businesses expanding their operations.",
    pros: [
      "Partner liability protection",
      "Credible business identity",
      "Moderate compliance cost (~₹10,000/year)",
      "Flexible management structure",
      "Easy partner admission/exit",
    ],
    iconName: "Users",
    explanationBullets: [
      "Team of 4–6 members — LLP balances structure with moderate compliance",
      "Mid-size team needs formal roles and partner agreements — LLP supports this naturally",
      "Operating across multiple channels — LLP gives the legal credibility vendors and aggregators expect",
      "Lower cost and complexity than a Private Limited Company at this stage",
    ],
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
    explanationBullets: [
      "Large team size (7+) requires formal corporate governance — Pvt Ltd is the standard",
      "National or international growth goal — Pvt Ltd is investor-ready and acquisition-ready",
      "Retail or corporate catering channels demand the highest credibility with partners",
      "Separate legal entity with perpetual succession — essential for long-term brand building",
    ],
    match: (p) => p.teamSize === "large" || p.teamSize === "enterprise",
  },
];

function determineBusinessStructure(profile: BusinessProfile): {
  structure: BusinessStructure;
  explanationBullets: string[];
} {
  for (const rule of structureRules) {
    if (rule.match(profile)) {
      const { explanationBullets, match: _m, ...rest } = rule;
      return { structure: rest, explanationBullets };
    }
  }

  return {
    structure: {
      name: "Sole Proprietorship",
      tagline: "The simplest way to get started",
      description:
        "Minimal paperwork, full control, and the fastest way to begin selling. Upgrade your structure as you grow.",
      pros: ["Zero registration cost", "Simple tax filing", "Full ownership", "Fastest path to launch"],
      iconName: "User",
    },
    explanationBullets: [
      "Starting simple with minimal team — sole proprietorship keeps upfront costs low",
      "No high-risk sales channels selected — simpler structure is sufficient at this stage",
      "Focus on validating your business concept before committing to a complex entity",
    ],
  };
}

/* ── Registrations ─────────────────────────────────────────────── */

function determineRegistrations(
  profile: BusinessProfile,
  structureName: string,
): Registration[] {
  const registrations: Registration[] = [];
  const gstRequired = needsGST(profile);
  const state = getStateFromLocation(profile.location);
  const stateName = getLocationDisplayName(state);

  // 1. FSSAI — always required for every food business
  const isHomeBased = hasHomeKitchen(profile) || isHomeChef(profile);
  registrations.push({
    id: "fssai",
    name: "FSSAI Registration",
    status: "Required",
    statusClass: "text-amber-700 bg-amber-50 border-amber-200",
    statusIconName: "Shield",
    description: isHomeBased
      ? "FSSAI Basic Registration (₹0–₹100) for home-based food businesses. Apply online with Aadhaar, kitchen photos, and business details."
      : `FSSAI State License (₹2,000–₹5,000) for commercial food establishments. Required for all food businesses exceeding basic turnover limits.`,
    timeline: isHomeBased ? "7–14 business days" : "15–30 business days",
    gradient: "from-amber-400 to-orange-500",
  });

  // 2. GST — based on sales channels and growth goal
  if (gstRequired) {
    registrations.push({
      id: "gst",
      name: "GST Registration",
      status: "Required",
      statusClass: "text-amber-700 bg-amber-50 border-amber-200",
      statusIconName: "AlertCircle",
      description: usesAggregators(profile)
        ? "Mandatory for onboarding with Swiggy, Zomato, and other aggregators. Apply with PAN, Aadhaar, business address proof, and bank details."
        : isCorporateCatering(profile)
          ? "Required for corporate catering contracts. Most corporate clients insist on GST-compliant vendors."
          : "GST registration required for online sales, retail, or scaling businesses.",
      timeline: "5–7 business days",
      gradient: "from-blue-400 to-indigo-500",
    });
  } else {
    registrations.push({
      id: "gst",
      name: "GST Registration",
      status: "May be required",
      statusClass: "text-blue-700 bg-blue-50 border-blue-200",
      statusIconName: "Clock",
      description: "Not immediately required for your current sales model. Monitor annual turnover — GST becomes mandatory above ₹40L (goods) or ₹20L (services).",
      timeline: "When turnover crosses threshold",
      gradient: "from-blue-400 to-indigo-500",
    });
  }

  // 3. UDYAM MSME — recommended for all
  registrations.push({
    id: "udyam",
    name: "UDYAM MSME Registration",
    status: "Recommended",
    statusClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    statusIconName: "FileText",
    description: isScaling(profile) || hasLargeTeam(profile)
      ? "MSME registration unlocks government subsidies, priority-sector lending, and collateral-free loans under Credit Guarantee Scheme."
      : "Free online registration that provides access to government schemes, tax benefits, and easier credit.",
    timeline: "1–2 business days",
    gradient: "from-emerald-400 to-emerald-600",
  });

  // 4. Trade License — for non-home kitchens
  if (!hasHomeKitchen(profile)) {
    const localPortals = getLocalPortalsForState(state);
    const portalInfo = localPortals.length > 0
      ? `${localPortals[0].portalName}`
      : `the respective State Government municipal portal`;

    registrations.push({
      id: "trade-license",
      name: "Trade License / Health License",
      status: "Required",
      statusClass: "text-amber-700 bg-amber-50 border-amber-200",
      statusIconName: "AlertCircle",
      description: `Required for commercial food premises. Apply through ${portalInfo} in ${stateName || "your state"}. Includes health inspection and fire safety clearance.`,
      timeline: "15–30 business days",
      gradient: "from-amber-400 to-orange-500",
    });
  }

  // 5. Fire NOC — for commercial kitchens with large teams or cloud kitchens
  if (!hasHomeKitchen(profile) && (hasLargeTeam(profile) || isCloudKitchen(profile) || usesAggregators(profile))) {
    const localPortals = getLocalPortalsForState(state);
    const firePortal = localPortals.find(p => p.portalName.toLowerCase().includes("fire"));

    registrations.push({
      id: "fire-noc",
      name: "Fire Department NOC",
      status: "Required",
      statusClass: "text-amber-700 bg-amber-50 border-amber-200",
      statusIconName: "AlertCircle",
      description: firePortal
        ? `Mandatory NOC from the fire department. Apply through ${firePortal.portalName} for ${stateName || "your state"}.`
        : `Mandatory NOC from the local fire department for commercial kitchens in ${stateName || "your state"}.`,
      timeline: "15–30 business days",
      gradient: "from-amber-400 to-orange-500",
    });
  }

  // 6. FSSAI Label — for packaged food
  if (isBakery(profile) || isMealPrep(profile) || isRetail(profile)) {
    registrations.push({
      id: "fssai-label",
      name: "FSSAI Label & Packaging Compliance",
      status: "Required",
      statusClass: "text-amber-700 bg-amber-50 border-amber-200",
      statusIconName: "AlertCircle",
      description: "All pre-packaged food products must display FSSAI license number, ingredient list, nutritional info, net quantity, MRP, and dates on labels.",
      timeline: "Complete before product launch",
      gradient: "from-amber-400 to-orange-500",
    });
  }

  // 7. Company Incorporation — for LLP and Pvt Ltd
  if (structureName.includes("Private Limited") || structureName.includes("LLP")) {
    const isPvtLtd = structureName.includes("Private Limited");
    registrations.push({
      id: "incorporation",
      name: isPvtLtd ? "Company Incorporation (RoC)" : "LLP Registration (RoC)",
      status: "Required",
      statusClass: "text-amber-700 bg-amber-50 border-amber-200",
      statusIconName: "AlertCircle",
      description: isPvtLtd
        ? "Register your Private Limited Company with the RoC. Requires DIN, DSC, and incorporation documents."
        : "Register your LLP with the RoC. Requires DPIN for partners, DSC, and LLP agreement.",
      timeline: "10–15 business days",
      gradient: "from-amber-400 to-orange-500",
    });
  }

  // 8. Professional Tax — for specific states
  if (state === "karnataka" || state === "maharashtra" || state === "telangana") {
    registrations.push({
      id: "professional-tax",
      name: "Professional Tax Registration",
      status: "Required",
      statusClass: "text-amber-700 bg-amber-50 border-amber-200",
      statusIconName: "AlertCircle",
      description: `Professional tax registration is mandatory for employers in ${stateName || "your state"}. Register with the state commercial tax department.`,
      timeline: "Within 30 days of hiring",
      gradient: "from-amber-400 to-orange-500",
    });
  }

  // 9. Shop & Establishment — for commercial premises with team
  if (!hasHomeKitchen(profile) && hasLargeTeam(profile)) {
    registrations.push({
      id: "shop-establishment",
      name: "Shop & Establishment Act Registration",
      status: "Required",
      statusClass: "text-amber-700 bg-amber-50 border-amber-200",
      statusIconName: "AlertCircle",
      description: `Registration under the state's Shop & Establishment Act for commercial premises with employees in ${stateName || "your state"}.`,
      timeline: "7–14 business days",
      gradient: "from-amber-400 to-orange-500",
    });
  }

  // 10. Payment Setup — for retail or own-website
  if (isRetail(profile) || isOwnWebsite(profile) || usesAggregators(profile)) {
    registrations.push({
      id: "payment-setup",
      name: "Payment Processing Setup",
      status: "Recommended",
      statusClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
      statusIconName: "FileText",
      description: isRetail(profile)
        ? "Set up a POS system and card payment terminal. Providers include Razorpay, Pinelabs, Paytm for Business."
        : "Integrate an online payment gateway (Razorpay, PhonePe, Cashfree) for your website.",
      timeline: "3–7 business days",
      gradient: "from-emerald-400 to-emerald-600",
    });
  }

  return registrations;
}

/* ── Readiness score ────────────────────────────────────────────── */

function computeReadinessScore(profile: BusinessProfile): {
  score: number;
  message: string;
} {
  let score = 30;

  if (profile.businessType && profile.businessType !== "") {
    score += profile.businessType !== "other" ? 12 : 8;
  }

  if (kitchenIsUnknown(profile)) {
    score += 2;
  } else if (hasHomeKitchen(profile)) {
    score += 10;
  } else if (hasCommercialKitchen(profile)) {
    score += 13;
  }

  if (profile.location && profile.location !== "") score += 8;

  const channelScores: Record<string, number> = {
    "aggregators": 12, "multiple": 12, "corporate-catering": 11,
    "retail": 10, "own-website": 9, "direct-sales": 6, "social-media": 6,
  };
  score += channelScores[profile.salesChannels] ?? 5;

  const teamScores: Record<string, number> = {
    "solo": 4, "small": 6, "medium": 8, "large": 10, "enterprise": 10,
  };
  score += teamScores[profile.teamSize] ?? 4;

  const growthScores: Record<string, number> = {
    "side-hustle": 5, "full-time": 7, "scale": 9, "national-brand": 10, "international": 10,
  };
  score += growthScores[profile.growthGoal] ?? 4;

  if (kitchenIsUnknown(profile)) score -= 5;
  if (!profile.location || profile.location === "") score -= 5;

  const complexity = (isCloudKitchen(profile) ? 3 : 0) +
    (hasLargeTeam(profile) ? 3 : 0) +
    (isNationalBrand(profile) ? 2 : 0) +
    (isInternationalGoal(profile) ? 2 : 0) +
    (usesAggregators(profile) ? 1 : 0);
  score -= Math.min(complexity, 8);

  if (usesAggregators(profile) && isScaling(profile)) score += 3;
  if (hasCommercialKitchen(profile) && !isSolo(profile)) score += 2;

  const clamped = Math.min(98, Math.max(30, Math.round(score)));

  const bizType = profile.businessTypeLabel?.toLowerCase() || "food";
  const bizLoc = profile.locationLabel || "your area";
  const bizChannel = profile.salesChannelsLabel?.toLowerCase() || "sales";
  const bizGoal = profile.growthGoalLabel?.toLowerCase() || "growth";
  const bizKitchen = profile.kitchenTypeLabel?.toLowerCase() || "";

  let message: string;
  if (clamped >= 85) {
    message =
      `Your ${bizType} venture in ${bizLoc} is well prepared to launch. You have a clear business model, a ${bizKitchen} base, and a strong foundation across all key areas. Focus on executing your registrations and operational setup — you're ready to hit the ground running.`;
  } else if (clamped >= 70) {
    message =
      `Your ${bizType} business in ${bizLoc} is on a solid path to launch. Your core decisions (${bizKitchen}, ${bizChannel}) are made — now lock in the key registrations and operational setup to reach your ${bizGoal} goal.`;
  } else if (clamped >= 55) {
    message =
      `Good progress on your ${bizType} idea in ${bizLoc}. Tying down a few specifics — like your ${bizKitchen || "kitchen setup"}, location details, and the best ${bizChannel} approach — will sharpen your launch plan and boost your readiness.`;
  } else {
    message =
      `You're at the very start of your ${bizType} journey in ${bizLoc} — and that's perfectly fine. Use this assessment as a starter checklist: decide on your kitchen model, pin down your location, and choose the sales channel that fits your ${bizGoal} ambition.`;
  }

  return { score: clamped, message };
}

/* ── AI Confidence estimation ─────────────────────────────────── */

function computeAiConfidence(profile: BusinessProfile): AiConfidence {
  const supportingPoints: string[] = [];
  const concerns: string[] = [];
  let score = 50;

  if (profile.businessType && profile.businessType !== "" && profile.businessType !== "other") {
    score += 10;
    supportingPoints.push("Business type clearly defined");
  } else if (profile.businessType && profile.businessType !== "") {
    score += 5;
    supportingPoints.push("Business type identified");
  } else {
    concerns.push("Business type not specified");
  }

  if (!kitchenIsUnknown(profile)) {
    score += 10;
    supportingPoints.push("Kitchen type selected");
  } else {
    concerns.push("Kitchen type not finalized");
  }

  if (profile.location && profile.location !== "") {
    score += 8;
    supportingPoints.push("Business location selected");
  } else {
    concerns.push("State not selected");
  }

  if (profile.salesChannels && profile.salesChannels !== "") {
    score += 8;
    supportingPoints.push("Sales channel identified");
  } else {
    concerns.push("Sales channel not specified");
  }

  if (profile.teamSize && profile.teamSize !== "") score += 5;
  if (profile.growthGoal && profile.growthGoal !== "") {
    score += 5;
    if (isScaling(profile)) supportingPoints.push("Growth goal consistent with ambition");
  } else {
    concerns.push("Growth goal not defined");
  }

  if (usesAggregators(profile) && needsGST(profile)) {
    score += 4;
    supportingPoints.push("Sales channel and compliance requirements aligned");
  }
  if (hasHomeKitchen(profile) && isSolo(profile)) {
    score += 3;
    supportingPoints.push("Kitchen type and team size well-matched");
  }
  if (hasCommercialKitchen(profile) && isScaling(profile)) {
    supportingPoints.push("Commercial kitchen supports growth plans");
  }
  if (isSolo(profile) && isNationalBrand(profile)) {
    concerns.push("Solo founder aiming for national brand may need a larger team");
    score -= 3;
  }
  if (isFoodTruck(profile) && isInternationalGoal(profile)) {
    concerns.push("International expansion from a food truck model requires careful planning");
    score -= 2;
  }

  const clamped = Math.min(99, Math.max(30, Math.round(score)));

  const topPoint = supportingPoints.length > 0
    ? supportingPoints[0].toLowerCase()
    : "your business direction";
  const topConcern = concerns.length > 0
    ? concerns[0].toLowerCase()
    : null;

  let label: string;
  let explanation: string;
  if (clamped >= 85) {
    label = "High Confidence";
    explanation = `K2 has strong confidence because ${topPoint} — your profile is well-defined with clear decisions across all key areas.`;
  } else if (clamped >= 65) {
    label = "Medium Confidence";
    explanation = topConcern
      ? `K2 has moderate confidence. Your ${topPoint} is clear, but ${topConcern} — clarifying this will strengthen your recommendations.`
      : `K2 has moderate confidence. Your ${topPoint} is clear, though a few more details would sharpen the recommendations.`;
  } else {
    label = "Low Confidence";
    explanation = topConcern
      ? `K2's confidence is limited because ${topConcern}. Adding details in this area will help produce more accurate, tailored recommendations.`
      : `K2's confidence is limited. More details about your business model would help provide more accurate recommendations.`;
  }

  return { score: clamped, label, explanation, supportingPoints, concerns };
}

/* ── Next best action ──────────────────────────────────────────── */

function determineNextBestAction(profile: BusinessProfile): NextBestAction {
  const bizType = profile.businessTypeLabel?.toLowerCase() || "food";
  const bizLoc = profile.locationLabel || "your area";

  if (kitchenIsUnknown(profile)) {
    return {
      title: "Determine Your Kitchen Model First",
      description: `For your ${bizType} idea in ${bizLoc}, the kitchen model drives every other decision. Decide whether you'll cook from home, rent a shared kitchen space, or set up a commercial facility — each path has different costs, timelines, and registration needs.`,
    };
  }

  if (!profile.location || profile.location === "") {
    return {
      title: "Choose Your Operating Location",
      description: `Your ${bizType} business needs a base. Location determines which municipal licenses apply, which aggregators serve your area, and who your customers are. Select your city or state to unlock location-specific recommendations.`,
    };
  }

  if (isNationalBrand(profile) || isInternationalGoal(profile)) {
    const entityType = hasLargeTeam(profile) ? "Private Limited Company" : "LLP";
    const ambition = isInternationalGoal(profile) ? "international" : "national";
    return {
      title: `Incorporate Your ${entityType} First`,
      description: `Your ${ambition} ambition for your ${bizType} venture in ${bizLoc} demands a formal structure from day one. ${entityType} incorporation gives you the legal identity, credibility, and compliance framework needed for investor discussions, retail partnerships, and cross-state operations.`,
    };
  }

  if (usesAggregators(profile)) {
    return {
      title: "Register for GST Before Aggregator Onboarding",
      description: `Swiggy and Zomato require GST before they'll list your ${bizType} in ${bizLoc}. Apply as soon as you have your PAN and address proof — this unlocks aggregator onboarding and keeps you compliant from day one.`,
    };
  }

  if (isCorporateCatering(profile) && needsGST(profile)) {
    return {
      title: "Register Your Business & Get GST for Corporate Contracts",
      description: `Corporate clients in ${bizLoc} nearly always insist on GST-compliant vendors with a formal business structure. Start with business registration, then apply for GST so you can pitch to offices, events, and institutions.`,
    };
  }

  if (hasHomeKitchen(profile)) {
    const isBakeryOp = profile.businessType === "bakery";
    return {
      title: "Apply for FSSAI Basic Registration Immediately",
      description: isBakeryOp
        ? `As a home-based bakery in ${bizLoc}, FSSAI Basic registration (₹0–₹100) is your fastest path to legality. Apply online with your Aadhaar — this is the single step that turns your baking hobby into a legitimate business.`
        : `As a home-based ${bizType} business in ${bizLoc}, FSSAI Basic registration (₹0–₹100) is your fastest path to legality. Apply online with your Aadhaar and kitchen details — it costs almost nothing and makes you a legitimate food business.`,
    };
  }

  if (hasCommercialKitchen(profile) && isScaling(profile)) {
    return {
      title: "Apply for FSSAI State License",
      description: `Your ${bizType} in ${bizLoc} operates from a commercial kitchen and you're scaling — that means a State FSSAI license (₹2,000–₹5,000) is your primary compliance requirement. Get this before trade licenses or aggregator onboarding.`,
    };
  }

  if (hasLargeTeam(profile)) {
    return {
      title: "Incorporate Your Company & Set Up Compliance",
      description: `With a team of 7+ running your ${bizType} operation in ${bizLoc}, you need a formal corporate structure. Start with Private Limited Company incorporation, then set up your compliance framework — payroll, EPF/ESIC, and professional tax.`,
    };
  }

  if (isRetail(profile)) {
    return {
      title: "Apply for Trade License from Your Local Municipality",
      description: `Your retail ${bizType} outlet in ${bizLoc} needs a trade license from the local municipal corporation. Start this process early — it typically takes 15–30 days and involves a health inspection of your premises.`,
    };
  }

  return {
    title: "Apply for FSSAI Registration",
    description: `FSSAI registration is the single most important step for your ${bizType} business in ${bizLoc}. It's a legal requirement, it builds customer trust, and it's your gateway to working with aggregators and retailers. Start here.`,
  };
}

/* ── Location-aware resources ─────────────────────────────────── */

function determineResources(profile: BusinessProfile): Resource[] {
  const resources: Resource[] = [];
  const state = getStateFromLocation(profile.location);
  const stateName = getLocationDisplayName(state);

  resources.push({
    name: "FSSAI Official Portal",
    url: "https://fssai.gov.in",
    description: "Apply for food safety license, check guidelines, and track application status.",
  });

  if (needsGST(profile) || profile.salesChannels === "aggregators" || profile.salesChannels === "multiple") {
    resources.push({
      name: "GST Portal",
      url: "https://gst.gov.in",
      description: "Register for GST, file returns, and manage compliance online.",
    });
  }

  resources.push({
    name: "UDYAM MSME Registration",
    url: "https://udyamregistration.gov.in",
    description: "Register your business as an MSME to access government schemes and subsidies.",
  });

  const { structure } = determineBusinessStructure(profile);
  if (structure.name.includes("Private Limited") || structure.name.includes("LLP")) {
    resources.push({
      name: "Ministry of Corporate Affairs (MCA)",
      url: "https://mca.gov.in",
      description: "Company/LLP incorporation, annual filings, DIN/DSC services, and compliance portal.",
    });
  }

  if (state && state !== "") {
    const localPortals = getLocalPortalsForState(state);
    if (localPortals.length > 0) {
      localPortals.forEach((portal) => {
        resources.push({
          name: portal.portalName,
          url: portal.portalUrl,
          description: `${portal.description} Official portal for ${stateName}.`,
        });
      });
    } else {
      resources.push({
        name: `${stateName} State Government Portal`,
        url: `https://www.${state.replace(/-/g, "")}.gov.in`,
        description: `Official portal for ${stateName}. Check local municipal corporation for trade license requirements.`,
      });
    }
  }

  return resources;
}

/* ── Estimated timeline & cost ─────────────────────────────────── */

function estimateTimeline(profile: BusinessProfile): string {
  let weeks = 4;
  if (hasHomeKitchen(profile)) weeks = 3;
  if (hasCommercialKitchen(profile)) weeks += 2;
  if (hasLargeTeam(profile)) weeks += 2;
  if (isCloudKitchen(profile)) weeks += 1;
  if (usesAggregators(profile)) weeks += 2;
  if (profile.businessType === "bakery") weeks -= 1;
  if (isNationalBrand(profile) || isInternationalGoal(profile)) weeks += 3;
  return `${Math.max(weeks - 2, 2)}–${weeks + 2} weeks`;
}

function estimateComplianceCost(profile: BusinessProfile): string {
  let minCost = 1000;
  let maxCost = 5000;

  if (hasCommercialKitchen(profile)) { minCost += 3000; maxCost += 8000; }
  if (hasLargeTeam(profile) || hasMediumTeam(profile)) { minCost += 5000; maxCost += 15000; }
  if (isCloudKitchen(profile)) { minCost += 2000; maxCost += 5000; }
  if (usesAggregators(profile) || isRetail(profile)) { minCost += 2000; maxCost += 5000; }
  if (profile.businessType === "bakery" && hasHomeKitchen(profile)) { minCost = Math.max(minCost - 2000, 500); maxCost = Math.max(maxCost - 3000, 2000); }
  if (isNationalBrand(profile) || isInternationalGoal(profile)) { minCost += 10000; maxCost += 25000; }

  return `₹${minCost.toLocaleString("en-IN")} – ₹${maxCost.toLocaleString("en-IN")}`;
}

function buildReasoningSummary(profile: BusinessProfile, structureName: string): string[] {
  const bullets: string[] = [];
  const typeLabel = profile.businessTypeLabel?.toLowerCase() || "";
  const kitchenLabel = profile.kitchenTypeLabel?.toLowerCase() || "";
  const locationLabel = profile.locationLabel || "";
  const channelLabel = profile.salesChannelsLabel?.toLowerCase() || "";
  const teamLabel = profile.teamSizeLabel?.toLowerCase() || "";
  const goalLabel = profile.growthGoalLabel?.toLowerCase() || "";

  if (typeLabel && locationLabel) {
    bullets.push(`K2 assessed a ${typeLabel} business based in ${locationLabel}`);
  } else if (typeLabel) {
    bullets.push(`K2 assessed a ${typeLabel} business`);
  }

  if (kitchenLabel) {
    bullets.push(`Kitchen model: ${kitchenLabel}`);
  }
  if (channelLabel) {
    bullets.push(`Sales strategy: ${channelLabel}`);
  }
  if (teamLabel) {
    bullets.push(`Team size: ${teamLabel}`);
  }
  if (goalLabel) {
    bullets.push(`Growth ambition: ${goalLabel}`);
  }

  bullets.push(`Recommended structure: ${structureName} — tailored to this founder's profile`);
  return bullets;
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
    const { structure, explanationBullets } = determineBusinessStructure(profile);
    const explanation = explanationBullets.join(". ") + ".";
    const { score, message } = computeReadinessScore(profile);

    return {
      recommendedBusinessStructure: structure,
      explanation,
      requiredRegistrations: determineRegistrations(profile, structure.name),
      launchReadinessScore: score,
      readinessMessage: message,
      nextBestAction: determineNextBestAction(profile),
      resources: determineResources(profile),
      // v2 new fields
      aiConfidence: computeAiConfidence(profile),
      estimatedLaunchTimeline: estimateTimeline(profile),
      estimatedComplianceCost: estimateComplianceCost(profile),
      reasoningSummary: buildReasoningSummary(profile, structure.name),
    };
  }
}

/** Singleton instance for convenience. */
export const ruleBasedService = new RuleBasedAssessmentService();