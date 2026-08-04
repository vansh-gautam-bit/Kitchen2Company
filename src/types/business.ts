/* ── BusinessProfile: structured data from Founder Consultation ── */

export interface BusinessProfile {
  businessType: string;
  businessTypeLabel: string;
  location: string;
  locationLabel: string;
  kitchenType: string;
  kitchenTypeLabel: string;
  salesChannels: string;
  salesChannelsLabel: string;
  teamSize: string;
  teamSizeLabel: string;
  growthGoal: string;
  growthGoalLabel: string;
}

/* ── Question / option data for the consultation flow ──────────── */

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  question: string;
  why: string;
  options: Option[];
}

/* ── BusinessAssessment: AI-generated recommendations (placeholder) ──
 *
 *  Data contract between the assessment engine and the dashboard UI.
 *  The assessment service is the SINGLE source of truth — no recommendation
 *  logic ever leaks into the dashboard or the business-profile types.
 *
 *  When the placeholder service is replaced by an AI model, only the
 *  implementation inside src/services/assessment.ts changes.
 *  This interface and all consumers remain untouched.
 */

export interface BusinessStructure {
  name: string;
  tagline: string;
  description: string;
  pros: string[];
  iconName: string; // lucide icon name — resolved by the UI component
}

export interface Registration {
  id: string;
  name: string;
  status: string;
  statusClass: string;
  statusIconName: string;
  description: string;
  timeline: string;
  gradient: string;
}

export interface NextBestAction {
  title: string;
  description: string;
}

export interface Resource {
  name: string;
  url: string;
  description: string;
}

export interface AiConfidence {
  /** Confidence score 0–100 */
  score: number;
  /** Human-readable label: "High Confidence", "Medium Confidence", "Low Confidence" */
  label: string;
  /** Short explanation of the confidence level */
  explanation: string;
  /** Points supporting high confidence */
  supportingPoints: string[];
  /** Factors that reduce confidence */
  concerns: string[];
}

export interface BusinessAssessment {
  /** The business structure recommended for this profile */
  recommendedBusinessStructure: BusinessStructure;

  /** Human-readable explanation of why the structure was chosen */
  explanation: string;

  /** Legal & compliance registrations required or recommended */
  requiredRegistrations: Registration[];

  /** Score 0–100 indicating how ready the founder is to launch */
  launchReadinessScore: number;

  /** Contextual message displayed alongside the readiness score */
  readinessMessage: string;

  /** The single most impactful action the founder should take next */
  nextBestAction: NextBestAction;

  /** Official government portals and other helpful resources */
  resources: Resource[];

  /** AI confidence in the assessment (added in v2) */
  aiConfidence?: AiConfidence;

  /** Estimated timeline to launch, e.g. "4–8 weeks" */
  estimatedLaunchTimeline?: string;

  /** Estimated compliance cost range, e.g. "₹5,000 – ₹15,000" */
  estimatedComplianceCost?: string;

  /** Structured reasoning summary connecting profile answers to recommendations */
  reasoningSummary?: string[];
}