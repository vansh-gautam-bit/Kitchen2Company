/* ═══════════════════════════════════════════════════════════════════ *
 *  BusinessAssessment Engine (Backward Compat Layer)                *
 *                                                                   *
 *  ⚠ Sync generateAssessment() preserved for Dashboard/Roadmap     *
 *     fallback paths that use it inside useMemo.                   *
 *                                                                   *
 *  NEW CODE: Import from ./assessment/index instead (or use the    *
 *  getAssessmentService() factory exported below).                 *
 * ═══════════════════════════════════════════════════════════════════ */

import { RuleBasedAssessmentService } from "./assessment/RuleBasedAssessmentService";
import type {
  BusinessProfile,
  BusinessAssessment,
} from "../types/business";

const ruleService = new RuleBasedAssessmentService();

/**
 * Synchronous assessment generation — delegates to rule-based service.
 *
 * ⚠ Kept for backward compatibility with Dashboard and Roadmap
 *    fallback paths that call it inside useMemo.
 *
 * For new code, use the async `getAssessmentService().generate(profile)`
 * factory from `./assessment/index`.
 */
export function generateAssessment(
  profile: BusinessProfile,
): BusinessAssessment {
  return ruleService.generateSync(profile);
}

/* ── Re-export the new modular API ─────────────────────────────── */

export { getAssessmentService, getRuleBasedService } from "./assessment/index";
export type { AssessmentService } from "./assessment/types";