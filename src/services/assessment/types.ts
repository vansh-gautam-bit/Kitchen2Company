/* ═══════════════════════════════════════════════════════════════════ *
 *  Assessment Service Types                                         *
 *                                                                   *
 *  Interface for the assessment service and types for AI-driven     *
 *  assessment generation.                                           *
 * ═══════════════════════════════════════════════════════════════════ */

import type {
  BusinessProfile,
  BusinessAssessment,
} from "../../types/business";

/**
 * Service interface for generating business assessments.
 * Supports both sync (RuleBased) and async (AI) implementations.
 */
export interface AssessmentService {
  generate(profile: BusinessProfile): Promise<BusinessAssessment>;
}

/**
 * Raw response shape expected from the AI Edge Function.
 * This is the JSON schema the LLM is prompted to produce.
 */
export interface AIAssessmentResponse {
  recommendedBusinessStructure: {
    name: string;
    tagline: string;
    description: string;
    pros: string[];
    iconName: string;
  };
  explanation: string;
  requiredRegistrations: {
    id: string;
    name: string;
    status: "Required" | "Recommended" | "May be required" | "Not required";
    description: string;
    timeline: string;
  }[];
  launchReadinessScore: number;
  readinessMessage: string;
  nextBestAction: {
    title: string;
    description: string;
  };
  resources: {
    name: string;
    url: string;
    description: string;
  }[];
}

/**
 * Configuration for AI-based assessment generation.
 */
export interface AIAssessmentConfig {
  /** Master switch — if false, falls back to rule-based */
  enabled: boolean;
  /** Supabase Edge Function endpoint */
  apiEndpoint: string;
  /** Publishable API key for auth */
  publishableKey: string;
}