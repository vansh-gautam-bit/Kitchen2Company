import type { BusinessAssessment } from "../../types/business";
import type { OfficialResource } from "../../types/research";
import type { ResearchService } from "./types";
import { PLACEHOLDER_OFFICIAL_RESOURCES } from "./placeholderData";

/* ═══════════════════════════════════════════════════════════════════ *
 *  PlaceholderResearchService                                       *
 *                                                                   *
 *  Default provider that returns curated static data. Always        *
 *  available — no credentials needed. This is the provider the      *
 *  dashboard uses until Bright Data is configured.                  *
 * ═══════════════════════════════════════════════════════════════════ */

export class PlaceholderResearchService implements ResearchService {
  readonly providerId = "placeholder" as const;

  isAvailable(): boolean {
    return true;
  }

  async fetchOfficialResources(
    _assessment: BusinessAssessment,
    _signal?: AbortSignal,
  ): Promise<OfficialResource[]> {
    // Return a shallow copy to prevent mutation leaks.
    return [...PLACEHOLDER_OFFICIAL_RESOURCES];
  }
}