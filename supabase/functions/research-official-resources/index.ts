import { withSupabase } from "npm:@supabase/server";

/**
 * research-official-resources
 * ─────────────────────────────
 * Live official-resource research via Bright Data Web Unlocker.
 *
 * Request:  POST { assessment: BusinessAssessment }
 * Response: { resources: OfficialResource[] }
 *
 * The assessment's `requiredRegistrations` (names like "FSSAI License",
 * "GST Registration", "UDYAM Registration") are matched against a known
 * registry of official government portals. Each matching portal is fetched
 * through Bright Data's Web Unlocker (real, rendered page content) and the
 * first meaningful sentence becomes the resource description.
 *
 * Auth: publishable API key (verified by @supabase/server via `apikey`
 * header). The Bright Data token lives only in Supabase Edge Function
 * secrets (BRIGHTDATA_API_TOKEN) — never in client code.
 */

interface OfficialResource {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
}

interface PortalDef {
  keywords: string[];
  id: string;
  name: string;
  url: string;
  category: string;
  fallbackDescription: string;
}

const PORTALS: PortalDef[] = [
  {
    keywords: ["fssai", "food license", "food safety", "food business operator"],
    id: "fssai-portal",
    name: "FSSAI Official Portal",
    url: "https://fssai.gov.in",
    category: "government",
    fallbackDescription:
      "Apply for your FSSAI food safety licence, check guidelines, and track application status.",
  },
  {
    keywords: ["gst", "goods and services tax"],
    id: "gst-portal",
    name: "GST Portal",
    url: "https://www.gst.gov.in",
    category: "government",
    fallbackDescription:
      "Register for GST, file returns, and manage compliance online.",
  },
  {
    keywords: ["udyam", "msme", "small scale", "medium enterprise", "small enterprise"],
    id: "udyam-portal",
    name: "UDYAM Registration Portal",
    url: "https://udyamregistration.gov.in",
    category: "government",
    fallbackDescription:
      "Register your business as an MSME to access government schemes and subsidies.",
  },
  {
    keywords: ["shop", "establishment"],
    id: "shop-establishment-portal",
    name: "Shop & Establishment Act",
    url: "https://shopsestablishments.mca.gov.in",
    category: "government",
    fallbackDescription:
      "Register your shop or establishment and stay compliant with state labour laws.",
  },
  {
    keywords: ["trade license", "municipal", "local body"],
    id: "trade-license-portal",
    name: "Trade License Portal",
    url: "https://www.mcdonline.gov.in",
    category: "government",
    fallbackDescription:
      "Apply for a municipal trade licence to legally operate your business premises.",
  },
  {
    keywords: ["fire", "fire safety", "no objection"],
    id: "fire-license-portal",
    name: "Fire Safety (NOC) Portal",
    url: "https://www.mahafireservice.gov.in",
    category: "government",
    fallbackDescription:
      "Obtain the fire safety No-Objection Certificate required for food premises.",
  },
  {
    keywords: ["pollution", "environmental", "consent to establish"],
    id: "pollution-control-portal",
    name: "Pollution Control Board",
    url: "https://cpcb.nic.in",
    category: "government",
    fallbackDescription:
      "Check consent-to-establish requirements for food processing units.",
  },
];

/** Match portals against the registration names in the assessment. */
function matchPortals(registrationNames: string[]): PortalDef[] {
  const lowerNames = registrationNames.map((n) => n.toLowerCase());
  const matched = new Set<PortalDef>();

  for (const portal of PORTALS) {
    for (const keyword of portal.keywords) {
      if (lowerNames.some((n) => n.includes(keyword))) {
        matched.add(portal);
        break;
      }
    }
  }

  // If nothing matched, surface the core set so the user always sees results.
  return matched.size > 0 ? [...matched] : PORTALS.slice(0, 3);
}

/** Strip markdown/HTML noise and return a clean short description. */
function extractSnippet(raw: string): string | null {
  const cleaned = raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`\[\]()>|~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 40) return null;

  const snippet = cleaned.substring(0, 220).trim();
  return cleaned.length > 220 ? `${snippet}…` : snippet;
}

/** Fetch a portal page through Bright Data Web Unlocker. */
async function fetchPortalDescription(
  url: string,
  token: string
): Promise<string | null> {
  if (!token) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        zone: "web_unlocker1",
        url,
        format: "raw",
        method: "GET",
        country: "in",
        js_render: true,
        transform: "markdown",
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const text = await response.text();
    return extractSnippet(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const cors = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "apikey, content-type, authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
};

export default {
  fetch: withSupabase(
    { auth: "publishable", cors },
    async (req: Request) => {
      if (req.method !== "POST") {
        return Response.json(
          { resources: [] },
          { status: 405, headers: cors.headers }
        );
      }

      let assessment: { requiredRegistrations?: { name?: string }[] } | null =
        null;
      try {
        const body = await req.json();
        assessment = body?.assessment ?? null;
      } catch {
        // fall through to validation below
      }

      if (!assessment) {
        return Response.json(
          { resources: [] },
          { status: 400, headers: cors.headers }
        );
      }

      const registrationNames = (assessment.requiredRegistrations ?? [])
        .map((r) => r?.name ?? "")
        .filter(Boolean);

      const portals = matchPortals(registrationNames);
      const token = Deno.env.get("BRIGHTDATA_API_TOKEN") ?? "";

      const results = await Promise.allSettled(
        portals.map(async (portal) => {
          const liveDescription = await fetchPortalDescription(
            portal.url,
            token
          );
          const resource: OfficialResource = {
            id: portal.id,
            name: portal.name,
            url: portal.url,
            description: liveDescription ?? portal.fallbackDescription,
            category: portal.category,
          };
          return resource;
        })
      );

      const resources: OfficialResource[] = results
        .filter(
          (r): r is PromiseFulfilledResult<OfficialResource> =>
            r.status === "fulfilled"
        )
        .map((r) => r.value);

      return Response.json({ resources }, { headers: cors.headers });
    }
  ),
};
