/* ═══════════════════════════════════════════════════════════════════ *
 *  Assessment Service Factory                                      *
 *                                                                   *
 *  Provides a single entry point to get the appropriate assessment  *
 *  service. Checks the config to decide AI vs rule-based.          *
 * ═══════════════════════════════════════════════════════════════════ */

import type { AssessmentService } from "./types";
import { AIAssessmentService } from "./AIAssessmentService";
import { RuleBasedAssessmentService } from "./RuleBasedAssessmentService";
import { config } from "../../constants/config";

export type { AssessmentService, AIAssessmentConfig, AIAssessmentResponse } from "./types";

/** Shared instances (singletons). */
let aiService: AIAssessmentService | null = null;
let ruleService: RuleBasedAssessmentService | null = null;

/**
 * Get the best assessment service based on current config.
 * If AI is enabled, returns the AI service (which itself falls back
 * to rule-based on failure). Otherwise returns rule-based directly.
 */
export function getAssessmentService(): AssessmentService {
  if (config.aiAssessment.enabled) {
    if (!aiService) {
      aiService = new AIAssessmentService();
    }
    return aiService;
  }

  if (!ruleService) {
    ruleService = new RuleBasedAssessmentService();
  }
  return ruleService;
}

/**
 * Get the rule-based service explicitly (for backwards compat).
 */
export function getRuleBasedService(): RuleBasedAssessmentService {
  if (!ruleService) {
    ruleService = new RuleBasedAssessmentService();
  }
  return ruleService;
}