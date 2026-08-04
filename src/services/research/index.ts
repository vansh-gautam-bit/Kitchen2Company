import { config } from "../../constants/config";
import { BrightDataResearchService } from "./BrightDataResearchService";
import { PlaceholderResearchService } from "./PlaceholderResearchService";
import type { ResearchService } from "./types";

/* ═══════════════════════════════════════════════════════════════════ *
 *  Research Service — public entry point                            *
 *                                                                   *
 *  Consumers import `getResearchService()` and use the              *
 *  ResearchService interface. The active provider is decided here,  *
 *  driven by configuration:                                         *
 *                                                                   *
 *    config.brightData.enabled === true  → BrightDataResearchService *
 *    otherwise                          → PlaceholderResearchService *
 *                                                                   *
 *  Swapping the provider later never touches the dashboard.         *
 * ═══════════════════════════════════════════════════════════════════ */

// Cache the instance so every consumer shares one stable reference.
let cachedService: ResearchService | null = null;

/** Returns the active research provider for this session. */
export function getResearchService(): ResearchService {
  if (cachedService) return cachedService;

  cachedService = config.brightData.enabled
    ? new BrightDataResearchService({
        enabled: config.brightData.enabled,
        apiEndpoint: config.brightData.apiEndpoint,
        publishableKey: config.supabase.publishableKey,
      })
    : new PlaceholderResearchService();

  return cachedService;
}

// Re-export the public surface for convenient imports.
export type { ResearchService, BrightDataResearchConfig } from "./types";
export type { OfficialResource } from "../../types/research";
export { PlaceholderResearchService } from "./PlaceholderResearchService";
export { BrightDataResearchService } from "./BrightDataResearchService";
export { PLACEHOLDER_OFFICIAL_RESOURCES } from "./placeholderData";