/* ═══════════════════════════════════════════════════════════════════ *
 *  Launch Roadmap Engine                                            *
 *                                                                   *
 *  Transforms a BusinessProfile + BusinessAssessment into an        *
 *  ordered list of RoadmapStep items using the profile's specific   *
 *  answers — business type, location, kitchen, team size, channels, *
 *  growth goals, and recommended structure.                         *
 *                                                                   *
 *  v2: Truly dynamic roadmap generation. Every founder gets a      *
 *  unique set of steps based on their specific profile.             *
 * ═══════════════════════════════════════════════════════════════════ */

import type { BusinessProfile, BusinessAssessment } from "../types/business";
import type { Roadmap, RoadmapStep, StepStatus } from "../types/roadmap";

/* ═══════════════════════════════════════════════════════════════════ *
 *  PROFILE ANALYZERS                                                *
 * ═══════════════════════════════════════════════════════════════════ */

function usesAggregators(p: BusinessProfile): boolean {
  return p.salesChannels === "aggregators" || p.salesChannels === "multiple";
}

function needsGST(p: BusinessProfile): boolean {
  const gstChannels = ["aggregators", "own-website", "retail", "multiple", "corporate-catering"];
  const scalingGoals = ["scale", "national-brand", "international"];
  return !!(p.salesChannels && gstChannels.includes(p.salesChannels)) ||
    !!(p.growthGoal && scalingGoals.includes(p.growthGoal));
}

function isScaling(p: BusinessProfile): boolean {
  return ["scale", "national-brand", "international"].includes(p.growthGoal);
}

function isHomeBased(p: BusinessProfile): boolean {
  return p.kitchenType === "home-kitchen" || p.businessType === "home-chef";
}

function isCommercial(p: BusinessProfile): boolean {
  return p.kitchenType === "commercial" || p.kitchenType === "rented-commercial";
}

function isSolo(p: BusinessProfile): boolean {
  return p.teamSize === "solo";
}

function isSmallTeam(p: BusinessProfile): boolean {
  return p.teamSize === "small";
}

function isMediumTeam(p: BusinessProfile): boolean {
  return p.teamSize === "medium";
}

function isLargeTeam(p: BusinessProfile): boolean {
  return p.teamSize === "large" || p.teamSize === "enterprise";
}

function isBakery(p: BusinessProfile): boolean {
  return p.businessType === "bakery";
}

function isCloudKitchen(p: BusinessProfile): boolean {
  return p.businessType === "cloud-kitchen";
}

function isFoodTruck(p: BusinessProfile): boolean {
  return p.businessType === "food-truck";
}

function isCorporateCatering(p: BusinessProfile): boolean {
  return p.salesChannels === "corporate-catering";
}

function isRetail(p: BusinessProfile): boolean {
  return p.salesChannels === "retail";
}

function isMealPrep(p: BusinessProfile): boolean {
  return p.businessType === "meal-prep";
}

function isInternational(p: BusinessProfile): boolean {
  return p.growthGoal === "international";
}

function isNational(p: BusinessProfile): boolean {
  return p.growthGoal === "national-brand";
}

function usesLLPorPvtLtd(assessment: BusinessAssessment): boolean {
  const name = assessment.recommendedBusinessStructure.name;
  return name.includes("LLP") || name.includes("Private Limited");
}

/* ═══════════════════════════════════════════════════════════════════ *
 *  DYNAMIC STEP GENERATORS                                         *
 *  Each function returns a step if applicable, or null.            *
 * ═══════════════════════════════════════════════════════════════════ */

interface StepCandidate {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  priority: number; // lower = earlier in the sequence
  whyThisMatters: string;
}

function stepFSSAI(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  return {
    id: "fssai",
    title: isHomeBased(p) ? "Apply for FSSAI Basic Registration" : "Apply for FSSAI State License",
    description: isHomeBased(p)
      ? "Submit your FSSAI Basic registration online with Aadhaar, kitchen photos, and business details. The basic registration is free or ₹100 and covers home-based food businesses."
      : "Submit your FSSAI State license application with business address proof, kitchen layout, food safety plan, and identity documents. The fee ranges from ₹2,000–₹5,000 depending on your state and business size.",
    estimatedDuration: isHomeBased(p) ? "7–14 business days" : "15–30 business days",
    priority: isHomeBased(p) ? 10 : 30,
    whyThisMatters: "FSSAI registration is legally mandatory for every food business in India. Without it you cannot operate, cannot list on aggregators, and risk fines or closure. It also builds customer trust — your FSSAI number signals you are a legitimate business.",
  };
}

function stepGST(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  if (!needsGST(p)) return null;
  return {
    id: "gst",
    title: "Register for GST",
    description: usesAggregators(p)
      ? "Apply for GST registration on the GST portal. You will need PAN, Aadhaar, business address proof, and bank details. Aggregators require GST before onboarding — do this before approaching Swiggy or Zomato."
      : "Apply for GST registration on the GST portal. Required for online sales, retail, or scaling beyond the threshold. Enables input tax credit and B2B invoicing.",
    estimatedDuration: "5–7 business days",
    priority: usesAggregators(p) ? 20 : 40,
    whyThisMatters: "GST compliance is non-negotiable for scaling food businesses. It enables input tax credit on ingredients and packaging, is required by aggregators and B2B partners, and prepares you for growth beyond the threshold.",
  };
}

function stepUDYAM(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  return {
    id: "udyam",
    title: "Register as MSME (UDYAM)",
    description: "Register your business on the UDYAM portal using your Aadhaar and business details. The process is fully online and free. You will need your business name, address, bank account, and activity details.",
    estimatedDuration: "1–2 business days",
    priority: isHomeBased(p) ? 20 : 50,
    whyThisMatters: "MSME registration unlocks government subsidies, priority-sector lending, lower interest rates on business loans, and tax benefits. Many aggregator and retail partners also prefer working with registered MSMEs.",
  };
}

function stepIncorporation(p: BusinessProfile, a: BusinessAssessment): StepCandidate | null {
  if (!usesLLPorPvtLtd(a)) return null;
  const isPvtLtd = a.recommendedBusinessStructure.name.includes("Private Limited");

  return {
    id: "incorporation",
    title: isPvtLtd ? "Incorporate Private Limited Company" : "Register Limited Liability Partnership (LLP)",
    description: isPvtLtd
      ? "Register your Private Limited Company with the Registrar of Companies (RoC). You will need DIN (Director Identification Number) for all directors, DSC (Digital Signature Certificate), and incorporation documents including MOA and AOA. Post-incorporation, appoint an auditor and hold the first board meeting."
      : "Register your LLP with the Registrar of Companies (RoC). You will need DPIN for all designated partners, DSC (Digital Signature Certificate), and a LLP agreement. Post-registration, file the initial annual return within 30 days.",
    estimatedDuration: "10–15 business days",
    priority: 5,
    whyThisMatters: isPvtLtd
      ? "A Private Limited Company gives you the strongest legal foundation — separate legal entity, limited liability, investor-ready structure, and maximum credibility with partners, aggregators, and customers."
      : "An LLP combines flexibility with liability protection. It gives you a separate legal identity, partner protection, and the credibility needed for business banking and aggregator partnerships.",
  };
}

function stepTradeLicense(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  if (isHomeBased(p)) return null;
  return {
    id: "trade-license",
    title: "Apply for Trade License / Health License",
    description: "Apply for a trade license from your local municipal corporation. You will need your business registration proof, premises ownership/rental agreement, layout plan, and health clearance. The license covers health inspection, fire safety, and premises approval.",
    estimatedDuration: "15–30 business days",
    priority: isCommercial(p) && isCloudKitchen(p) ? 40 : 35,
    whyThisMatters: "A trade license is legally required for all commercial food premises. Operating without one can result in fines, closure orders, and difficulties with aggregator onboarding.",
  };
}

function stepFireNOC(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  if (isHomeBased(p)) return null;
  if (!isLargeTeam(p) && !isCloudKitchen(p) && !usesAggregators(p)) return null;
  return {
    id: "fire-noc",
    title: "Obtain Fire Department NOC",
    description: "Apply for a No Objection Certificate from the local fire department. You will need premises layout, fire safety equipment details (extinguishers, exits, alarms), and kitchen ventilation plans. The fire department will inspect the premises before issuing the NOC.",
    estimatedDuration: "15–30 business days",
    priority: isCloudKitchen(p) ? 45 : 55,
    whyThisMatters: "Fire NOC is mandatory for commercial food establishments, especially those with large teams or high cooking volumes. It ensures your kitchen meets safety standards and protects your team and customers.",
  };
}

function stepCurrentAccount(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  return {
    id: "current-account",
    title: "Open Business Current Account",
    description: "Open a dedicated current account for your food business using your registration certificates (FSSAI, GST if obtained, UDYAM, and incorporation documents if applicable). Most Indian banks offer MSME-specific accounts with low minimum balances.",
    estimatedDuration: "3–5 business days",
    priority: usesLLPorPvtLtd({ ..._a }) ? 60 : 25,
    whyThisMatters: "Separating personal and business finances is critical for tax compliance, liability protection, and professional credibility. It also makes bookkeeping and GST filing vastly simpler.",
  };
}

function stepAggregatorOnboarding(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  if (!usesAggregators(p)) return null;
  return {
    id: "aggregator",
    title: "Onboard with Online Aggregators",
    description: "Create merchant accounts on Swiggy, Zomato, and other platforms. You will need your FSSAI license, GST certificate, menu with pricing, high-quality food photos, kitchen images, and bank account for payouts. Prepare a launch offer to attract first orders.",
    estimatedDuration: "1–3 weeks",
    priority: 70,
    whyThisMatters: "Aggregators are the primary discovery channel for food businesses in India. Listing on even one platform can multiply your daily orders and give you data on customer preferences in your area.",
  };
}

function stepPackagingLabel(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  if (!isBakery(p) && !isMealPrep(p) && !isRetail(p)) return null;
  return {
    id: "packaging-label",
    title: "Set Up Packaging & Label Compliance",
    description: "Design and print compliant labels for your packaged products. Labels must display: FSSAI license number, product name, ingredient list (descending order), nutritional information, net quantity, MRP, manufacturing date, best-before date, and manufacturer address. Source packaging materials that preserve food quality and match your brand.",
    estimatedDuration: "1–2 weeks",
    priority: 25,
    whyThisMatters: "Pre-packaged food products must comply with FSSAI labelling regulations. Non-compliant labels can result in penalties, product seizures, and customer distrust. Good packaging also differentiates your brand on shelves.",
  };
}

function stepSOPs(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  if (isSolo(p) && isHomeBased(p)) return null;
  return {
    id: "sops",
    title: isSolo(p) ? "Document Your Recipes & Process" : "Create Standard Operating Procedures (SOPs)",
    description: isLargeTeam(p) || isMediumTeam(p)
      ? "Document every step of your kitchen operations — ingredient sourcing, prep workflows, cooking times, portion control, packaging standards, and cleaning schedules. SOPs ensure consistency across your team and are essential for scaling."
      : "Document your recipes, prep workflow, and portion standards. Even for a small team, written procedures ensure consistency and make it easier to train new members.",
    estimatedDuration: "1–2 weeks",
    priority: isLargeTeam(p) ? 50 : 65,
    whyThisMatters: "A well-organised kitchen with documented processes is the backbone of your business. Consistent quality, efficient prep, and reliable procedures directly impact customer retention and ratings.",
  };
}

function stepMarketing(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  return {
    id: "marketing",
    title: "Launch Brand & Marketing",
    description: isHomeBased(p) || isSolo(p)
      ? "Set up Instagram and Facebook business pages with your menu and food photos. Create a simple WhatsApp Business account for orders. Design a basic logo and consistent visual theme. Leverage local food groups and word-of-mouth."
      : "Set up social media profiles, create a professional website or menu page, design your logo and packaging, and plan your launch campaign. Invest in professional food photography. Leverage local SEO and food blogger outreach for organic reach.",
    estimatedDuration: isSolo(p) ? "1 week" : "2–3 weeks",
    priority: 75,
    whyThisMatters: "Great food doesn't sell itself — especially in a crowded market. A strong brand identity and targeted marketing ensure your launch creates buzz and attracts your first customers.",
  };
}

function stepPilotLaunch(p: BusinessProfile, a: BusinessAssessment): StepCandidate | null {
  // Cloud kitchens, corporate catering, and large teams benefit from a soft launch
  if (!isCloudKitchen(p) && !isCorporateCatering(p) && !isLargeTeam(p)) return null;
  return {
    id: "pilot-launch",
    title: "Conduct Pilot / Soft Launch",
    description: "Run a limited pilot launch with a small menu (5–10 items) to test operations, gather feedback, and refine processes. Invite friends, family, and early supporters. Monitor order accuracy, delivery times, food quality, and customer feedback before scaling.",
    estimatedDuration: "1–2 weeks",
    priority: 80,
    whyThisMatters: "A soft launch lets you identify operational bottlenecks before full-scale operations. It reduces the risk of negative reviews during your main launch and gives you real data to optimise your menu and workflow.",
  };
}

function stepGoLive(p: BusinessProfile, _a: BusinessAssessment): StepCandidate | null {
  return {
    id: "go-live",
    title: "Go Live & Take First Orders",
    description: isRetail(p)
      ? "Open your retail outlet, stock your shelves, activate your POS system, and welcome your first walk-in customers. Announce your opening on social media and local community boards."
      : usesAggregators(p)
        ? "Activate your aggregator listings, make your website/menu live, announce on social media, and start accepting orders. Monitor early feedback closely and iterate on your menu, pricing, and delivery experience."
        : "Announce your launch on social media, activate your ordering channels, and start accepting orders. Monitor early feedback closely and iterate on your menu and customer experience.",
    estimatedDuration: "Launch day & ramp-up",
    priority: 90,
    whyThisMatters: "This is the moment everything comes together. Your first orders validate your concept, operations, and customer experience. Each order is data — use it to refine and grow.",
  };
}

/* ── Step generators registry ────────────────────────────────── */

const STEP_GENERATORS: ((p: BusinessProfile, a: BusinessAssessment) => (StepCandidate | null))[] = [
  stepFSSAI,
  stepGST,
  stepUDYAM,
  stepIncorporation,
  stepTradeLicense,
  stepFireNOC,
  stepCurrentAccount,
  stepPackagingLabel,
  stepAggregatorOnboarding,
  stepSOPs,
  stepMarketing,
  stepGoLive,
  stepPilotLaunch,
];

/* ═══════════════════════════════════════════════════════════════════ *
 *  ROADMAP BUILDING                                                 *
 * ═══════════════════════════════════════════════════════════════════ */

function determineStatuses(
  profile: BusinessProfile,
  assessment: BusinessAssessment,
): Record<string, StepStatus> {
  const statuses: Record<string, StepStatus> = {};

  // Consultation is always completed when we have a profile
  statuses["consultation"] = "completed";

  // Mark first few required steps as in-progress based on readiness
  const highScore = assessment.launchReadinessScore >= 70;
  const midScore = assessment.launchReadinessScore >= 55;

  statuses["fssai"] = highScore ? "in-progress" : "pending";
  statuses["gst"] = needsGST(profile) ? "in-progress" : "pending";
  statuses["udyam"] = midScore ? "in-progress" : "pending";
  statuses["incorporation"] = "pending";
  statuses["trade-license"] = "pending";
  statuses["fire-noc"] = "pending";
  statuses["current-account"] = "pending";
  statuses["packaging-label"] = "pending";
  statuses["aggregator"] = "pending";
  statuses["sops"] = "pending";
  statuses["marketing"] = "pending";
  statuses["go-live"] = "pending";
  statuses["pilot-launch"] = "pending";

  return statuses;
}

function buildSteps(
  profile: BusinessProfile,
  assessment: BusinessAssessment,
): RoadmapStep[] {
  const status = determineStatuses(profile, assessment);

  // Generate all applicable steps
  const candidates: StepCandidate[] = [];
  for (const generator of STEP_GENERATORS) {
    const step = generator(profile, assessment);
    if (step) candidates.push(step);
  }

  // Sort by priority
  candidates.sort((a, b) => a.priority - b.priority);

  // Map to RoadmapStep and assign sequential numbers
  const steps: RoadmapStep[] = candidates.map((c, index) => ({
    id: c.id,
    stepNumber: index + 1,
    title: c.title,
    description: c.description,
    estimatedDuration: c.estimatedDuration,
    status: status[c.id] ?? "pending",
    whyThisMatters: c.whyThisMatters,
  }));

  return steps;
}

function computeTotalDuration(profile: BusinessProfile): string {
  let baseWeeks = 4;
  let extraWeeks = 0;

  if (isHomeBased(profile)) baseWeeks = 3;
  if (isCommercial(profile)) extraWeeks += 2;
  if (usesAggregators(profile)) extraWeeks += 2;
  if (isLargeTeam(profile) || isMediumTeam(profile)) extraWeeks += 2;
  if (isCloudKitchen(profile)) extraWeeks += 1;
  if (isNational(profile) || isInternational(profile)) extraWeeks += 3;
  if (isFoodTruck(profile)) extraWeeks += 1;

  const totalMin = baseWeeks + Math.max(extraWeeks - 1, 0);
  const totalMax = baseWeeks + extraWeeks + 2;

  return `${Math.min(totalMin, totalMax)}–${totalMax} weeks`;
}

/* ═══════════════════════════════════════════════════════════════════ *
 *  PUBLIC API                                                       *
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