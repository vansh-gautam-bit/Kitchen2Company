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
 * 2. Sends it to OpenAI with a structured system prompt
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
Your job is to analyse a food entrepreneur's profile and produce a structured assessment.

Respond with valid JSON ONLY — no markdown, no code fences, no extra text.

The JSON must match this exact structure:

{
  "recommendedBusinessStructure": {
    "name": "string (one of: Sole Proprietorship, Limited Liability Partnership (LLP), Private Limited Company (Pvt. Ltd.))",
    "tagline": "string (short compelling tagline)",
    "description": "string (2-3 sentence description of the structure)",
    "pros": ["string array (3-5 key advantages)"],
    "iconName": "string (one of: User, Users, Building2)"
  },
  "explanation": "string (2-3 sentence personalised explanation of why this structure fits)",
  "requiredRegistrations": [
    {
      "id": "string (unique id like fssai, gst, udyam, trade-license, fire-noc, etc.)",
      "name": "string (human-readable name)",
      "status": "string (one of: Required, Recommended, May be required, Not required)",
      "description": "string (1-2 sentence description)",
      "timeline": "string (estimated timeline like '7-14 business days')"
    }
  ],
  "launchReadinessScore": number (integer 30-98),
  "readinessMessage": "string (supportive message based on the score)",
  "nextBestAction": {
    "title": "string (short action title)",
    "description": "string (2-3 sentence action description)"
  },
  "resources": [
    {
      "name": "string (resource name)",
      "url": "string (valid URL)",
      "description": "string (1 sentence description)"
    }
  ]
}

Rules:
- launchReadinessScore should be 30-98 based on profile completeness and ambition
- Always include FSSAI Registration as "Required" for any food business
- Include GST Registration based on sales channels (aggregators, retail, own-website = Required)
- Include UDYAM Registration as "Recommended" for small to medium businesses
- Be specific and personalised — don't use generic responses
- Use realistic timelines based on current Indian government processing times
- recommendedBusinessStructure: solo/small + side-hustle/full-time → Sole Proprietorship; solo/small + scale/national/international → LLP; medium → LLP; large/enterprise → Pvt Ltd
- iconName must be one of: User, Users, Building2`;

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

      const openAiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openAiKey) {
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
              Authorization: `Bearer ${openAiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages,
              temperature: 0.7,
              max_tokens: 2000,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown");
          console.error(
            `[generate-ai-assessment] OpenAI returned ${response.status}: ${errorText}`
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