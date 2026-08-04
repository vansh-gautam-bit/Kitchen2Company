/* ═══════════════════════════════════════════════════════════════════ *
 *  Application Configuration                                       *
 *                                                                   *
 *  BRIGHT DATA:                                                     *
 *  The Bright Data API token is a SECRET and must never ship in     *
 *  client code. It belongs in Supabase Secret Manager and may only  *
 *  be read inside an Edge Function that hosts the Bright Data MCP   *
 *  server. Until a Supabase project is linked and that Edge         *
 *  Function is deployed, the provider stays disabled and the        *
 *  Research Service gracefully falls back to placeholder data.      *
 * ═══════════════════════════════════════════════════════════════════ */

export const config = {
  brightData: {
    /**
     * Master switch — set to `true` ONLY after:
     * 1. Supabase project is linked and integration is active.
     * 2. Bright Data API token stored in Secret Manager.
     * 3. Edge Function deployed that proxies @brightdata/mcp.
     */
    enabled: false,

    /** Base URL of the future server-side proxy (Supabase Edge Function). */
    apiEndpoint: "",
  },
} as const;