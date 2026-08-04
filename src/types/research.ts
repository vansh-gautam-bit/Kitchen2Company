/* ═══════════════════════════════════════════════════════════════════ *
 *  Research Service Data Types                                      *
 *                                                                   *
 *  The Research Service is an independent data source for the       *
 *  dashboard — it retrieves official resources (government portals, *
 *  documents, tools) related to a BusinessAssessment. When Bright   *
 *  Data is configured it returns live results; otherwise it         *
 *  gracefully falls back to curated placeholder data.              *
 *                                                                   *
 *  The dashboard never imports these types directly — it depends    *
 *  only on the ResearchService interface from `services/research`.  *
 * ═══════════════════════════════════════════════════════════════════ */

/** A single official resource (government portal, document, tool). */
export interface OfficialResource {
  /** Stable identifier for the resource. */
  id: string;
  /** Display name of the portal / document. */
  name: string;
  /** Canonical URL. */
  url: string;
  /** Short human-readable description. */
  description: string;
  /** Optional tag describing the source, e.g. "government". */
  category?: string;
}