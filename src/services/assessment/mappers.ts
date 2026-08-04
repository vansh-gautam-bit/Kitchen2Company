/* ═══════════════════════════════════════════════════════════════════ *
 *  AI Assessment Mappers                                            *
 *                                                                   *
 *  Maps the raw AIAssessmentResponse (from the LLM) to the full    *
 *  BusinessAssessment type that the rest of the app expects.        *
 * ═══════════════════════════════════════════════════════════════════ */

import type {
  BusinessAssessment,
  BusinessStructure,
  Registration,
  NextBestAction,
  Resource,
} from "../../types/business";
import type { AIAssessmentResponse } from "./types";

/**
 * Map an AIAssessmentResponse to a full BusinessAssessment.
 * Adds the UI-only fields (statusClass, statusIconName, gradient)
 * that the AI doesn't produce.
 */
export function mapAIResponseToAssessment(
  ai: AIAssessmentResponse
): BusinessAssessment {
  const structure: BusinessStructure = {
    name: ai.recommendedBusinessStructure.name,
    tagline: ai.recommendedBusinessStructure.tagline,
    description: ai.recommendedBusinessStructure.description,
    pros: ai.recommendedBusinessStructure.pros,
    iconName: ai.recommendedBusinessStructure.iconName,
  };

  const registrations: Registration[] = ai.requiredRegistrations.map((r) => {
    const isRequired = r.status === "Required";
    const isMayBe = r.status === "May be required";

    return {
      id: r.id,
      name: r.name,
      status: r.status,
      statusClass: isRequired
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : isMayBe
          ? "text-blue-700 bg-blue-50 border-blue-200"
          : "text-emerald-700 bg-emerald-50 border-emerald-200",
      statusIconName: isRequired ? "AlertCircle" : isMayBe ? "Clock" : "FileText",
      description: r.description,
      timeline: r.timeline,
      gradient: isRequired
        ? "from-amber-400 to-orange-500"
        : isMayBe
          ? "from-blue-400 to-indigo-500"
          : "from-emerald-400 to-emerald-600",
    };
  });

  const nextBestAction: NextBestAction = {
    title: ai.nextBestAction.title,
    description: ai.nextBestAction.description,
  };

  const resources: Resource[] = ai.resources.map((r) => ({
    name: r.name,
    url: r.url,
    description: r.description,
  }));

  return {
    recommendedBusinessStructure: structure,
    explanation: ai.explanation,
    requiredRegistrations: registrations,
    launchReadinessScore: Math.min(98, Math.max(30, Math.round(ai.launchReadinessScore))),
    readinessMessage: ai.readinessMessage,
    nextBestAction,
    resources,
  };
}