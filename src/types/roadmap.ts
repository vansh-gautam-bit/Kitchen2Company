/* ═══════════════════════════════════════════════════════════════════ *
 *  Roadmap Data Types                                               *
 *                                                                   *
 *  A Roadmap is an ordered list of launch steps derived from the    *
 *  BusinessProfile and BusinessAssessment. The roadmap service is   *
 *  the single source of truth — no step logic ever leaks into the   *
 *  UI or other services.                                            *
 * ═══════════════════════════════════════════════════════════════════ */

export type StepStatus = "completed" | "in-progress" | "pending";

export interface RoadmapStep {
  /** Stable identifier for this step. */
  id: string;
  /** Sequential position in the roadmap (1-based). */
  stepNumber: number;
  /** Short action-oriented title. */
  title: string;
  /** Detailed what / how-to description. */
  description: string;
  /** Human-readable timeline, e.g. "7–14 business days". */
  estimatedDuration: string;
  /** Current status. */
  status: StepStatus;
  /** Why this step matters for the founder's business. */
  whyThisMatters: string;
}

export interface Roadmap {
  /** Steps ordered by recommended sequence. */
  steps: RoadmapStep[];
  /** Total estimated timeline across all steps, e.g. "2–4 weeks". */
  totalEstimatedDuration: string;
}