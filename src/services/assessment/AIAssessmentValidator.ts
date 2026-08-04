/* ═══════════════════════════════════════════════════════════════════ *
 *  AI Assessment Validator                                         *
 *                                                                   *
 *  Validates the raw JSON response from the AI to ensure it matches *
 *  the expected schema before mapping to BusinessAssessment.        *
 * ═══════════════════════════════════════════════════════════════════ */

import type { AIAssessmentResponse } from "./types";

/** Result of validation — either the parsed response or an error message. */
export type ValidationResult =
  | { ok: true; data: AIAssessmentResponse }
  | { ok: false; error: string };

/**
 * Validate that a raw object conforms to AIAssessmentResponse.
 * Performs structural checks (not deep type narrowing) so that
 * a malformed LLM response is caught early and the caller can
 * fall back to rule-based logic.
 */
export function validateAIAssessmentResponse(
  raw: unknown
): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Response is not an object" };
  }

  const r = raw as Record<string, unknown>;

  // Check top-level required fields
  const requiredFields = [
    "recommendedBusinessStructure",
    "explanation",
    "requiredRegistrations",
    "launchReadinessScore",
    "readinessMessage",
    "nextBestAction",
    "resources",
  ];

  for (const field of requiredFields) {
    if (r[field] === undefined || r[field] === null) {
      return { ok: false, error: `Missing required field: "${field}"` };
    }
  }

  // Check recommendedBusinessStructure
  if (typeof r.recommendedBusinessStructure !== "object") {
    return { ok: false, error: '"recommendedBusinessStructure" is not an object' };
  }
  const struct = r.recommendedBusinessStructure as Record<string, unknown>;
  for (const f of ["name", "tagline", "description", "pros", "iconName"]) {
    if (struct[f] === undefined) {
      return { ok: false, error: `Missing field in recommendedBusinessStructure: "${f}"` };
    }
  }
  if (!Array.isArray(struct.pros)) {
    return { ok: false, error: '"recommendedBusinessStructure.pros" is not an array' };
  }

  // Check explanation
  if (typeof r.explanation !== "string") {
    return { ok: false, error: '"explanation" is not a string' };
  }

  // Check requiredRegistrations
  if (!Array.isArray(r.requiredRegistrations)) {
    return { ok: false, error: '"requiredRegistrations" is not an array' };
  }
  for (let i = 0; i < r.requiredRegistrations.length; i++) {
    const reg = r.requiredRegistrations[i];
    if (!reg || typeof reg !== "object") {
      return { ok: false, error: `requiredRegistrations[${i}] is not an object` };
    }
    const rReg = reg as Record<string, unknown>;
    for (const f of ["id", "name", "status", "description", "timeline"]) {
      if (rReg[f] === undefined) {
        return { ok: false, error: `Missing field in requiredRegistrations[${i}]: "${f}"` };
      }
    }
  }

  // Check launchReadinessScore
  if (typeof r.launchReadinessScore !== "number") {
    return { ok: false, error: '"launchReadinessScore" is not a number' };
  }

  // Check readinessMessage
  if (typeof r.readinessMessage !== "string") {
    return { ok: false, error: '"readinessMessage" is not a string' };
  }

  // Check nextBestAction
  if (typeof r.nextBestAction !== "object") {
    return { ok: false, error: '"nextBestAction" is not an object' };
  }
  const nba = r.nextBestAction as Record<string, unknown>;
  for (const f of ["title", "description"]) {
    if (nba[f] === undefined) {
      return { ok: false, error: `Missing field in nextBestAction: "${f}"` };
    }
  }

  // Check resources
  if (!Array.isArray(r.resources)) {
    return { ok: false, error: '"resources" is not an array' };
  }
  for (let i = 0; i < r.resources.length; i++) {
    const res = r.resources[i];
    if (!res || typeof res !== "object") {
      return { ok: false, error: `resources[${i}] is not an object` };
    }
    const rRes = res as Record<string, unknown>;
    for (const f of ["name", "url", "description"]) {
      if (rRes[f] === undefined) {
        return { ok: false, error: `Missing field in resources[${i}]: "${f}"` };
      }
    }
  }

  // Check aiConfidence (new fields — warn but don't fail for backward compat)
  if (r.aiConfidence !== undefined && r.aiConfidence !== null) {
    if (typeof r.aiConfidence !== "object") {
      return { ok: false, error: '"aiConfidence" is not an object' };
    }
    const ac = r.aiConfidence as Record<string, unknown>;
    for (const f of ["score", "label", "explanation", "supportingPoints", "concerns"]) {
      if (ac[f] === undefined) {
        return { ok: false, error: `Missing field in aiConfidence: "${f}"` };
      }
    }
    if (typeof ac.score !== "number") {
      return { ok: false, error: '"aiConfidence.score" is not a number' };
    }
    if (!Array.isArray(ac.supportingPoints)) {
      return { ok: false, error: '"aiConfidence.supportingPoints" is not an array' };
    }
    if (!Array.isArray(ac.concerns)) {
      return { ok: false, error: '"aiConfidence.concerns" is not an array' };
    }
  }

  // Check estimatedLaunchTimeline (optional but validate if present)
  if (r.estimatedLaunchTimeline !== undefined && typeof r.estimatedLaunchTimeline !== "string") {
    return { ok: false, error: '"estimatedLaunchTimeline" is not a string' };
  }

  // Check estimatedComplianceCost (optional but validate if present)
  if (r.estimatedComplianceCost !== undefined && typeof r.estimatedComplianceCost !== "string") {
    return { ok: false, error: '"estimatedComplianceCost" is not a string' };
  }

  // Check reasoningSummary (optional but validate if present)
  if (r.reasoningSummary !== undefined) {
    if (!Array.isArray(r.reasoningSummary)) {
      return { ok: false, error: '"reasoningSummary" is not an array' };
    }
  }

  return { ok: true, data: r as unknown as AIAssessmentResponse };
}