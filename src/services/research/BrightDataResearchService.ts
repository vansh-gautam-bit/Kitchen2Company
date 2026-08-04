import type { BusinessAssessment } from "../../types/business";
import type { OfficialResource } from "../../types/research";
import type { BrightDataResearchConfig, ResearchService } from "./types";
import { PlaceholderResearchService } from "./PlaceholderResearchService";

/* ═══════════════════════════════════════════════════════════════════ *
 *  BrightDataResearchService                                        *
 *                                                                   *
 *  DESIGN — how Bright Data gets wired in later:                    *
 *  1. The Bright Data API token is a SECRET. It must never be       *
 *     embedded in client code. When a Supabase project is linked,   *
 *     the token goes into Secret Manager and is read ONLY inside    *
 *     an Edge Function.                                             *
 *  2. Bright Data ships an MCP server (@brightdata/mcp). An Edge    *
 *     Function hosts that server (or proxies its HTTP transport)    *
 *     and exposes a tiny endpoint: POST { assessment } →            *
 *     { resources }.                                                *
 *  3. This class already implements the client side of that         *
 *     contract: when enabled it POSTs the assessment to             *
 *     apiEndpoint and normalises the response into OfficialResource[]. *
 *  4. The dashboard depends ONLY on the ResearchService interface,  *
 *     so enabling Bright Data (flip the flag in config.ts) requires *
 *     ZERO changes to dashboard or UI code.                         *
 *                                                                   *
 *  Until credentials exist, `enabled` is false and this provider    *
 *  degrades gracefully to the placeholder provider — the dashboard  *
 *  never breaks.                                                    *
 * ═══════════════════════════════════════════════════════════════════ */

export class BrightDataResearchService implements ResearchService {
  readonly providerId = "bright-data" as const;

  private readonly config: BrightDataResearchConfig;

  /** Composed fallback so this provider never returns an empty result. */
  private readonly fallback = new PlaceholderResearchService();

  constructor(config: BrightDataResearchConfig) {
    this.config = config;
  }

  isAvailable(): boolean {
    return this.config.enabled && this.config.apiEndpoint.trim().length > 0;
  }

  async fetchOfficialResources(
    assessment: BusinessAssessment,
    signal?: AbortSignal,
  ): Promise<OfficialResource[]> {
    if (!this.isAvailable()) {
      return this.fallback.fetchOfficialResources(assessment, signal);
    }

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment }),
        signal,
      });

      if (!response.ok) {
        console.warn(
          `[research] Bright Data proxy returned ${response.status} — falling back to placeholder data.`,
        );
        return this.fallback.fetchOfficialResources(assessment, signal);
      }

      const payload = (await response.json()) as { resources?: OfficialResource[] };
      const resources = Array.isArray(payload.resources) ? payload.resources : [];

      return resources.length > 0
        ? resources
        : this.fallback.fetchOfficialResources(assessment, signal);
    } catch (error) {
      // Let genuine cancellations propagate; everything else degrades gracefully.
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
      console.warn("[research] Bright Data lookup failed — falling back to placeholder data.", error);
      return this.fallback.fetchOfficialResources(assessment, signal);
    }
  }
}