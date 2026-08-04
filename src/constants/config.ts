/* ═══════════════════════════════════════════════════════════════════ *
 *  Application Configuration                                       *
 *                                                                   *
 *  BRIGHT DATA:                                                     *
 *  The Bright Data API token is a SECRET and never ships in client  *
 *  code. It lives in Supabase Secret Manager and is read only inside *
 *  the `research-official-resources` Edge Function, which proxies   *
 *  live research via the Bright Data Web Unlocker API.              *
 *                                                                   *
 *  The Supabase PUBLISHABLE key below is safe to embed in client    *
 *  code by design — it identifies this app (low privileges, guarded *
 *  by RLS) and is used to authenticate calls to the Edge Function   *
 *  via the `apikey` header.                                        *
 * ═══════════════════════════════════════════════════════════════════ */

export const config = {
  supabase: {
    /** Project URL for the linked Supabase project (Ouroboros). */
    projectUrl: "https://rutxdvsvrjesycgmcekz.supabase.co",
    /**
     * Publishable API key — safe for client code. Authenticates the
     * Edge Function calls via the `apikey` header.
     */
    publishableKey: "sb_publishable_RwNQmkYFntNgvGVGIp0sNw_p8L-_69A",
  },
  brightData: {
    /**
     * Master switch — now `true` because:
     * 1. Supabase project linked and integration active.
     * 2. Bright Data API token stored in Secret Manager
     *    (BRIGHTDATA_API_TOKEN).
     * 3. Edge Function `research-official-resources` deployed.
     */
    enabled: true,

    /**
     * Server-side proxy (Supabase Edge Function) that performs live
     * official-resource research through Bright Data Web Unlocker.
     */
    apiEndpoint:
      "https://rutxdvsvrjesycgmcekz.supabase.co/functions/v1/research-official-resources",
  },

  /**
   * AI-powered assessment configuration.
   *
   * When enabled, the Consultation page calls the Supabase Edge Function
   * to generate assessments via an LLM (AI/ML API). On failure, falls
   * back to the deterministic rule-based engine.
   *
   * The AI/ML API key is a SECRET — stored in Supabase Secret Manager
   * as OPENAI_API_KEY (backwards-compatible naming) and read only inside
   * the Edge Function.
   */
  aiAssessment: {
    enabled: true,

    apiEndpoint:
      "https://rutxdvsvrjesycgmcekz.supabase.co/functions/v1/generate-ai-assessment",

    publishableKey: "sb_publishable_RwNQmkYFntNgvGVGIp0sNw_p8L-_69A",
  },
} as const;