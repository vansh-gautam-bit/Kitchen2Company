/* ═══════════════════════════════════════════════════════════════════ *
 *  AI Assessment Service                                           *
 *                                                                   *
 *  Async service that calls the Supabase Edge Function to generate *
 *  assessments via an LLM (AI/ML API), validates the JSON response,*
 *  and maps it to BusinessAssessment. Falls back to the            *
 *  RuleBasedAssessmentService if the AI call fails.                 *
 * ═══════════════════════════════════════════════════════════════════ */

import type { BusinessProfile, BusinessAssessment } from "../../types/business";
import type { AssessmentService, AIAssessmentConfig } from "./types";
import { validateAIAssessmentResponse } from "./AIAssessmentValidator";
import { mapAIResponseToAssessment } from "./mappers";
import { RuleBasedAssessmentService } from "./RuleBasedAssessmentService";
import { config } from "../../constants/config";

/**
 * AI-powered assessment service.
 * Calls the configured Edge Function, validates, and maps the response.
 * Falls back to rule-based on any failure.
 */
export class AIAssessmentService implements AssessmentService {
  private fallback: RuleBasedAssessmentService;
  private aiConfig: AIAssessmentConfig;

  constructor(aiConfig?: AIAssessmentConfig) {
    this.fallback = new RuleBasedAssessmentService();
    this.aiConfig = aiConfig ?? config.aiAssessment;
  }

  async generate(profile: BusinessProfile): Promise<BusinessAssessment> {
    // If AI is disabled, use rule-based directly
    if (!this.aiConfig.enabled) {
      console.log("[AIAssessmentService] AI disabled, using rule-based fallback");
      return this.fallback.generate(profile);
    }

    try {
      const response = await fetch(this.aiConfig.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.aiConfig.publishableKey,
        },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.warn(
          `[AIAssessmentService] Edge Function returned ${response.status}: ${errorText}`
        );
        return this.fallback.generate(profile);
      }

      const body = await response.json();

      // The Edge Function returns { rawAssessment: AIAssessmentResponse }
      const raw = body?.rawAssessment;

      if (!raw) {
        console.warn("[AIAssessmentService] No rawAssessment in response, falling back");
        return this.fallback.generate(profile);
      }

      // Validate the response structure
      const validation = validateAIAssessmentResponse(raw);
      if (!validation.ok) {
        console.warn(
          `[AIAssessmentService] Validation failed: ${validation.error}`
        );
        return this.fallback.generate(profile);
      }

      // Map AI response to full BusinessAssessment
      return mapAIResponseToAssessment(validation.data);
    } catch (err) {
      console.warn("[AIAssessmentService] Error calling AI:", err);
      return this.fallback.generate(profile);
    }
  }
}