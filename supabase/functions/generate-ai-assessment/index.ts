import { withSupabase } from "npm:@supabase/server";

/**
 * generate-ai-assessment
 * ─────────────────────────
 * Generates a business assessment using AI/ML API's model.
 *
 * Request:  POST { profile: BusinessProfile }
 * Response: { rawAssessment: AIAssessmentResponse }
 *
 * The function:
 * 1. Receives a BusinessProfile from the client
 * 2. Sends it to the AI model with a structured system prompt
 * 3. Validates the JSON response shape
 * 4. Returns the raw assessment for client-side mapping
 *
 * Auth: publishable API key (verified by @supabase/server via `apikey`
 * header). The API key lives only in Supabase Edge Function
 * secrets (OPENAI_API_KEY) — never in client code.
 */

/* ── Types ─────────────────────────────────────────────────────── */

interface BusinessProfile {
  businessType: string;
  businessTypeLabel: string;
  location: string;
  locationLabel: string;
  kitchenType: string;
  kitchenTypeLabel: string;
  salesChannels: string;
  salesChannelsLabel: string;
  teamSize: string;
  teamSizeLabel: string;
  growthGoal: string;
  growthGoalLabel: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const cors = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "apikey, content-type, authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
};

/* ── System Prompt ─────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are K2, an expert AI launch advisor for food businesses in India.
Your job is to analyse a food entrepreneur's profile and produce a structured, highly personalised assessment.
Every recommendation must be EXPLICITLY connected to the founder's specific answers — never generic.

## CRITICAL: DO NOT WRITE GENERICALLY
Every text field in the JSON below must reference at least one specific detail from the founder's profile
(business type, location, kitchen, sales channel, team size, or growth goal). If two different founders
could receive the same text verbatim, it is not personalised enough. Rewrite it.

BAD (generic): "You're well prepared to launch. Your business model is clear."
GOOD (personalised): "Your cloud kitchen in Bengaluru is well prepared to launch. You have a clear aggregator-focused business model and a large team ready to execute."

BAD (generic): "FSSAI registration is required for all food businesses."
GOOD (personalised): "FSSAI Basic Registration (₹0–₹100) for your home-based bakery in Kerala."

BAD (generic): "Consider your growth goals when choosing a structure."
GOOD (personalised): "With a team of 4-6 aiming for scale, LLP in Maharashtra gives you the credibility for corporate catering contracts."

Respond with valid JSON ONLY — no markdown, no code fences, no extra text.

The JSON must match this exact structure:

{
  "recommendedBusinessStructure": {
    "name": "string (one of: Sole Proprietorship, Limited Liability Partnership (LLP), Private Limited Company (Pvt. Ltd.))",
    "tagline": "string (short compelling tagline personalised to this profile)",
    "description": "string (2-3 sentence description specific to this business case)",
    "pros": ["string array (3-5 key advantages — make them specific, not generic)"],
    "iconName": "string (one of: User, Users, Building2)"
  },
  "explanation": "string (2-3 paragraph explanation with BULLET POINTS explicitly connecting the founder's profile to this structure. Start with: 'K2 selected [Structure] because:' then list specific reasons)",
  "requiredRegistrations": [
    {
      "id": "string (unique id like fssai, gst, udyam, trade-license, fire-noc, incorporation, fssai-label, professional-tax, shop-establishment, payment-setup, etc.)",
      "name": "string (human-readable name)",
      "status": "string (one of: Required, Recommended, May be required, Not required)",
      "description": "string (1-2 sentence description specific to this business — mention costs, mention state if relevant)",
      "timeline": "string (estimated timeline like '7-14 business days')"
    }
  ],
  "launchReadinessScore": "number (integer 30-98 — see scoring rules below)",
  "readinessMessage": "string (supportive message that MUST reference at least TWO specific details from this founder's profile — e.g. business type + location, or kitchen + sales channel)",
  "nextBestAction": {
    "title": "string (short action title — very specific, e.g. 'Register for GST via GST Portal')",
    "description": "string (3-4 sentence action description explaining WHY this step first for THIS founder — reference their specific business type, location, and goal)"
  },
  "resources": [
    {
      "name": "string (resource name)",
      "url": "string (valid URL — must be correct state portal if state-specific)",
      "description": "string (1 sentence description of what this resource helps with)"
    }
  ],
  "aiConfidence": {
    "score": "number (integer 30-99)",
    "label": "string (one of: High Confidence, Medium Confidence, Low Confidence)",
    "explanation": "string (1-2 sentence explanation of confidence level — reference specific profile details that drive confidence or concern)",
    "supportingPoints": ["string array — aspects that improve confidence, e.g. 'Business type clearly defined'"],
    "concerns": ["string array — aspects that reduce confidence, e.g. 'Kitchen type not finalized'"]
  },
  "estimatedLaunchTimeline": "string (e.g. '4–6 weeks', '8–12 weeks')",
  "estimatedComplianceCost": "string (e.g. '₹3,000 – ₹8,000')",
  "reasoningSummary": ["string array — 6-8 bullet points summarising the profile and recommendation. Vary the sentence structures — don't start every bullet with 'You...'"]
}

SCORING RULES — launchReadinessScore:
- Base 30. Add points for clarity and preparation.
- Known kitchen type: +10 (home) to +13 (commercial)
- Specific business type (not "other"): +12
- Location selected: +8
- Sales channel defined: +6 to +12 (aggregators/multiple = 12, social-media = 6)
- Team size: +4 to +10
- Growth goal: +5 to +10
- Subtract for complexity: cloud kitchen -3, large team -3, national/international goal -2 each
- Subtract if kitchen type unknown: -5
- Subtract if no location: -5
- Different founders should get NOTICEABLY different scores.
Examples: Home baker → 60-68, Cloud kitchen → 72-80, Corporate catering → 80-88, National brand → 65-75

REGISTRATION RULES — be specific, not generic:
- FSSAI is ALWAYS Required. For home-based businesses it's "FSSAI Basic Registration (₹0–₹100)". For commercial it's "FSSAI State License (₹2,000–₹5,000)".
- GST: Required if sales channels include aggregators, own-website, retail, corporate-catering, or multiple. Otherwise "May be required".
- UDYAM MSME: Always at least "Recommended".
- Trade License: Required for commercial premises. Mention the city/state name in the description.
- Fire NOC: Required for commercial kitchens with large teams, cloud kitchens, or aggregator sales.
- FSSAI Label Compliance: Required for bakeries, meal prep, or retail (packaged goods).
- Company/LLP Incorporation: Required if structure is LLP or Pvt Ltd.
- Professional Tax: Required in Karnataka, Maharashtra, Telangana.
- Shop & Establishment: Required for commercial premises with employees.
- Payment Setup: "Recommended" if retail, own-website, or aggregator sales.

STATE-AWARE RESOURCES RULES:
- Always include FSSAI portal and UDYAM portal.
- Include GST portal if GST is Required.
- Include MCA portal if structure is Pvt Ltd or LLP.
- Include STATE-SPECIFIC portals based on the founder's location:
  * Delhi → "Delhi MCD (Trade License)" → https://mcdonline.nic.in
  * Kerala → "Kerala Local Self Government" → https://lsgkerala.gov.in AND "Kerala Fire & Rescue Services" → https://fire.kerala.gov.in
  * Karnataka → "BBMP (Bengaluru)" → https://bbmp.gov.in AND "Karnataka Fire Department" → https://karnatakafire.com
  * Maharashtra → "MCGM (Mumbai)" → https://portal.mcgm.gov.in OR "PCMC (Pune)" → https://www.pcmcindia.gov.in
  * Tamil Nadu → "Tamil Nadu Urban Local Bodies" → https://tnurban.tn.gov.in AND "Tamil Nadu Fire & Rescue" → https://www.tnfrs.tn.gov.in
- If state is NOT in the curated list, return the state's general government portal URL.
- NEVER show a portal for the wrong state.

NEXT BEST ACTION RULES (choose the MOST impactful FIRST step):
- Kitchen type unknown → "Determine Your Kitchen Model First"
- No location → "Choose Your Operating Location"
- National brand / international goal → "Incorporate Your Company/LLP First"
- Aggregator sales → "Register for GST Before Aggregator Onboarding"
- Corporate catering → "Register Your Business & Get GST"
- Home kitchen → "Apply for FSSAI Basic Registration Immediately"
- Commercial + scaling → "Apply for FSSAI State License"
- Large team → "Incorporate Your Company & Set Up Compliance"
- Retail → "Apply for Trade License from Your Local Municipality"
- Default → "Apply for FSSAI Registration"

ROADMAP GUIDANCE (for reasoningSummary):
The roadmap should be dynamic based on profile. Think through the actual steps this founder would need.
Examples of different roadmaps:
SOLO HOME BAKER: FSSAI Basic → UDYAM → Packaging/Label Setup → Social Media Launch → Take Orders
CLOUD KITCHEN (8 staff): Incorporate LLP → FSSAI State → GST → Trade License → Fire NOC → Aggregator Onboarding → SOP Docs → Pilot Launch
NATIONAL BRAND: Incorporate Pvt Ltd → MCA Compliance → Manufacturing Facility → Vendor Contracts → Retail Distribution → Logistics → Investor Readiness
FOOD TRUCK: FSSAI → Trade License → Vehicle Permits → UDYAM → Payment Setup → Social Media → Launch Locations

BUSINESS STRUCTURE RULES:
- solo/small + side-hustle/full-time → Sole Proprietorship
- solo/small + scale/national/international → LLP
- medium (4-6 people) → LLP
- large (7+) / enterprise → Pvt Ltd
- iconName: User for Sole Proprietorship, Users for LLP, Building2 for Pvt Ltd

AI CONFIDENCE RULES:
- Start at 50. Add for: known business type (+10), known kitchen (+10), known location (+8), known channel (+8), growth goal consistent (+5), team size known (+5).
- Subtract for: unknown kitchen (-5), no location (-5), solo+national brand mismatch (-3), food truck+international mismatch (-2).
- >=85: "High Confidence", >=65: "Medium Confidence", else: "Low Confidence".

EXPLANATION FORMATTING:
Write the "explanation" field as 2-3 paragraphs with explicit bullet points connecting to the profile.
Start with "K2 selected [Structure] because:" then list 4-5 specific reasons.
Example: "K2 selected Private Limited Company because:
- Team size of 8 requires formal corporate governance
- National expansion plans need investor-ready structure
- Corporate catering clients expect Pvt Ltd credibility
- Multiple sales channels benefit from separate legal entity
The compliance costs (~₹15,000/year) are offset by the unlimited growth potential and limited liability protection this structure provides."`;

/* ── Handler ───────────────────────────────────────────────────── */

export default {
  fetch: withSupabase(
    { auth: "publishable", cors },
    async (req: Request) => {
      if (req.method !== "POST") {
        return Response.json(
          { rawAssessment: null },
          { status: 405, headers: cors.headers }
        );
      }

      let profile: BusinessProfile | null = null;
      try {
        const body = await req.json();
        profile = body?.profile ?? null;
      } catch {
        // fall through
      }

      if (!profile) {
        return Response.json(
          { rawAssessment: null, error: "Missing profile in request body" },
          { status: 400, headers: cors.headers }
        );
      }

      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) {
        console.error("[generate-ai-assessment] OPENAI_API_KEY not configured");
        return Response.json(
          { rawAssessment: null, error: "AI service not configured" },
          { status: 500, headers: cors.headers }
        );
      }

      const userMessage = `Analyse this food business profile and provide a structured assessment:

Business Type: ${profile.businessTypeLabel} (${profile.businessType})
Location: ${profile.locationLabel} (${profile.location})
Kitchen Type: ${profile.kitchenTypeLabel} (${profile.kitchenType})
Sales Channels: ${profile.salesChannelsLabel} (${profile.salesChannels})
Team Size: ${profile.teamSizeLabel} (${profile.teamSize})
Growth Goal: ${profile.growthGoalLabel} (${profile.growthGoal})`;

      const messages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ];

      try {
        const response = await fetch(
          "https://api.aimlapi.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "deepseek/deepseek-v4-flash",
              messages,
              temperature: 0.7,
              max_tokens: 3000,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown");
          console.error(
            `[generate-ai-assessment] AI/ML API returned ${response.status}: ${errorText}`
          );
          return Response.json(
            { rawAssessment: null, error: "AI generation failed" },
            { status: 502, headers: cors.headers }
          );
        }

        const data = await response.json();
        const content: string = data?.choices?.[0]?.message?.content ?? "";

        if (!content) {
          return Response.json(
            { rawAssessment: null, error: "Empty AI response" },
            { status: 502, headers: cors.headers }
          );
        }

        // Strip potential markdown code fences
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
        }

        let rawAssessment: unknown;
        try {
          rawAssessment = JSON.parse(cleaned);
        } catch {
          console.error(
            "[generate-ai-assessment] Failed to parse AI response as JSON:",
            cleaned.substring(0, 200)
          );
          return Response.json(
            { rawAssessment: null, error: "Invalid AI response format" },
            { status: 502, headers: cors.headers }
          );
        }

        return Response.json(
          { rawAssessment },
          { headers: cors.headers }
        );
      } catch (err) {
        console.error("[generate-ai-assessment] Fetch error:", err);
        return Response.json(
          { rawAssessment: null, error: "AI service error" },
          { status: 502, headers: cors.headers }
        );
      }
    }
  ),
};