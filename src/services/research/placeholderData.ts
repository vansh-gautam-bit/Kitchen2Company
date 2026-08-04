import type { OfficialResource } from "../../types/research";

/* ═══════════════════════════════════════════════════════════════════ *
 *  Placeholder Official Resources                                   *
 *                                                                   *
 *  Curated static data used when no live research provider          *
 *  (Bright Data) is configured. Returned by PlaceholderResearch-    *
 *  Service and used as the fallback inside BrightDataResearchService *
 *  when the live endpoint is unreachable.                           *
 * ═══════════════════════════════════════════════════════════════════ */

export const PLACEHOLDER_OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    id: "fssai-portal",
    name: "FSSAI Official Portal",
    url: "https://fssai.gov.in",
    description:
      "Apply for food safety license, check guidelines, and track application status.",
    category: "government",
  },
  {
    id: "udyam-portal",
    name: "UDYAM Registration Portal",
    url: "https://udyamregistration.gov.in",
    description:
      "Register your business as an MSME to access government schemes and subsidies.",
    category: "government",
  },
  {
    id: "gst-portal",
    name: "GST Portal",
    url: "https://gst.gov.in",
    description:
      "Register for GST, file returns, and manage compliance online.",
    category: "government",
  },
];