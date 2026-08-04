import type { BusinessAssessment } from "../../types/business";
import type { OfficialResource } from "../../types/research";

/* ═══════════════════════════════════════════════════════════════════ *
 *  ResearchService Interface                                        *
 *                                                                   *
 *  Every research provider (placeholder, Bright Data, future API)   *
 *  implements this contract. The dashboard depends ONLY on this     *
 *  interface, so providers can be swapped without touching UI code. *
 * ═══════════════════════════════════════════════════════════════════ */

export interface ResearchService {
  /** Human-readable identifier for the active provider. */
  readonly providerId: "bright-data" | "placeholder";

  /** Whether this provider's preconditions are met (credentials, etc.). */
  isAvailable(): boolean;

  /**
   * Retrieve official resources related to the given assessment.
   *
   * @param assessment — the completed founder consultation assessment
   * @param signal     — optional AbortSignal for cancellation
   * @returns a list of official resources (portals, documents, tools)
   */
  fetchOfficialResources(
    assessment: BusinessAssessment,
    signal?: AbortSignal,
  ): Promise<OfficialResource[]>;
}

/** Configuration required by the Bright Data provider. */
export interface BrightDataResearchConfig {
  /** Master switch; should only be true when server-side credentials are set. */
  enabled: boolean;
  /** Base URL of the server-side proxy (Supabase Edge Function). */
  apiEndpoint: string;
}