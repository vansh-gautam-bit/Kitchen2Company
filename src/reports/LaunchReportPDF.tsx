/* ═══════════════════════════════════════════════════════════════════ *
 *  Launch Report — PDF Document                                     *
 *                                                                   *
 *  Renders a professional PDF with @react-pdf/renderer that         *
 *  includes the founder profile, business assessment, registrations,*
 *  roadmap, resources, and timestamp.                               *
 *                                                                   *
 *  Uses the same emerald-green brand palette and clean hierarchy    *
 *  as the web app.                                                  *
 * ═══════════════════════════════════════════════════════════════════ */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { BusinessProfile, BusinessAssessment } from "../types/business";
import type { RoadmapStep } from "../types/roadmap";
import type { OfficialResource } from "../types/research";

/* ── Font registration ─────────────────────────────────────────── *
 *  We use Inter via Google Fonts gstatic CDN.                      */

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuOKfMZg.ttf",
      fontWeight: 300,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
      fontWeight: 700,
    },
  ],
});

/* ── Brand palette (matches index.css and PRD) ────────────────── */
const C = {
  emerald50: "#ECFDF5",
  emerald100: "#D1FAE5",
  emerald200: "#A7F3D0",
  emerald400: "#34D399",
  emerald500: "#10B981",
  emerald600: "#059669",
  emerald700: "#047857",
  emerald800: "#065F46",
  emerald900: "#064E3B",
  textPrimary: "#0F172A",
  textMuted: "#64748B",
  textSubtle: "#94A3B8",
  borderLight: "#E2E8F0",
  borderSubtle: "#F1F5F9",
  bgWarm: "#F9FAFB",
  white: "#FFFFFF",
  accent: "#F59E0B",
};

/* ── PDF styles ────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* ── Page layout ─────────────────────────────── */
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: "Inter",
    fontSize: 10,
    color: C.textPrimary,
    lineHeight: 1.5,
  },

  /* ── Cover page ──────────────────────────────── */
  coverPage: {
    padding: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.emerald800,
  },
  coverBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  coverBadgeText: {
    color: C.emerald200,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: C.white,
    textAlign: "center",
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 14,
    color: C.emerald200,
    textAlign: "center",
    maxWidth: 360,
    marginBottom: 40,
    lineHeight: 1.6,
  },
  coverDivider: {
    width: 60,
    height: 3,
    backgroundColor: C.emerald400,
    borderRadius: 2,
    marginBottom: 40,
  },
  coverMeta: {
    fontSize: 10,
    color: C.emerald200,
    textAlign: "center",
    lineHeight: 1.8,
  },

  /* ── Section header ─────────────────────────── */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: C.emerald600,
  },
  sectionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.emerald600,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: C.emerald800,
    letterSpacing: -0.3,
  },

  /* ── Sub-section ────────────────────────────── */
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: C.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  tagline: {
    fontSize: 10,
    color: C.emerald600,
    fontWeight: 500,
    marginBottom: 8,
  },

  /* ── Grid layout (for summary fields) ───────── */
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  gridItem: {
    width: "48%",
    backgroundColor: C.bgWarm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    padding: 10,
  },
  gridLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: C.textSubtle,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  gridValue: {
    fontSize: 10,
    fontWeight: 500,
    color: C.textPrimary,
  },

  /* ── Body text ──────────────────────────────── */
  bodyText: {
    fontSize: 10,
    color: C.textPrimary,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  mutedText: {
    fontSize: 9,
    color: C.textMuted,
    lineHeight: 1.5,
    marginBottom: 6,
  },

  /* ── Highlighted callout box ────────────────── */
  callout: {
    backgroundColor: C.emerald50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.emerald100,
    padding: 14,
    marginBottom: 12,
  },
  calloutLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: C.emerald700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 10,
    color: C.emerald800,
    lineHeight: 1.5,
  },

  /* ── Pros list ──────────────────────────────── */
  prosList: {
    marginTop: 4,
    gap: 4,
  },
  prosItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  prosBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.emerald400,
    marginTop: 3,
  },
  prosText: {
    fontSize: 10,
    color: C.textPrimary,
    lineHeight: 1.5,
    flex: 1,
  },

  /* ── Registration cards ─────────────────────── */
  regContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  regCard: {
    width: "48%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.borderLight,
    padding: 12,
  },
  regHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  regName: {
    fontSize: 10,
    fontWeight: 600,
    color: C.textPrimary,
    flex: 1,
  },
  regStatusBadge: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  regStatusReady: {
    color: C.emerald700,
    borderColor: C.emerald200,
    backgroundColor: C.emerald50,
  },
  regStatusPending: {
    color: C.textMuted,
    borderColor: C.borderLight,
    backgroundColor: C.bgWarm,
  },
  regDescription: {
    fontSize: 9,
    color: C.textMuted,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  regTimeline: {
    fontSize: 8,
    color: C.textSubtle,
    fontWeight: 500,
  },

  /* ── Readiness section ─────────────────────── */
  readinessContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  readinessScoreBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: C.emerald400,
    justifyContent: "center",
    alignItems: "center",
  },
  readinessScoreText: {
    fontSize: 24,
    fontWeight: 700,
    color: C.emerald700,
  },
  readinessMessage: {
    fontSize: 10,
    color: C.textMuted,
    lineHeight: 1.6,
    flex: 1,
    paddingTop: 12,
  },
  nextActionBox: {
    backgroundColor: `rgba(5, 150, 105, 0.08)`,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.emerald100,
    padding: 14,
    marginTop: 8,
  },
  nextActionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: C.emerald800,
    marginBottom: 4,
  },
  nextActionDesc: {
    fontSize: 9,
    color: C.emerald700,
    lineHeight: 1.5,
  },

  /* ── Roadmap timeline ───────────────────────── */
  roadmapContainer: {
    marginTop: 4,
    gap: 8,
  },
  roadmapStep: {
    flexDirection: "row",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSubtle,
    paddingBottom: 8,
    marginBottom: 4,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.emerald500,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: 700,
    color: C.white,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  stepTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: C.textPrimary,
    flex: 1,
  },
  stepDuration: {
    fontSize: 8,
    color: C.textSubtle,
    fontWeight: 500,
  },
  stepDescription: {
    fontSize: 9,
    color: C.textMuted,
    lineHeight: 1.5,
  },

  /* ── Resources list ────────────────────────── */
  resourceItem: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSubtle,
  },
  resourceName: {
    fontSize: 10,
    fontWeight: 600,
    color: C.emerald600,
    marginBottom: 2,
  },
  resourceDesc: {
    fontSize: 8,
    color: C.textMuted,
    lineHeight: 1.4,
  },
  resourceUrl: {
    fontSize: 7,
    color: C.textSubtle,
    marginTop: 2,
  },

  /* ── Page footer ────────────────────────────── */
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: C.textSubtle,
  },
  pageNumber: {
    fontSize: 7,
    color: C.textSubtle,
  },

  /* ── Spacer ─────────────────────────────────── */
  spacer: {
    height: 10,
  },
  largeSpacer: {
    height: 16,
  },
});

/* ── Page footer component ───────────────────────────────────── */

function PageFooter({ generationDate }: { generationDate: string }) {
  return (
    <View style={styles.pageFooter} fixed>
      <Text style={styles.footerText}>Kitchen2Company — Launch Report</Text>
      <Text style={styles.footerText}>Generated {generationDate}</Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber: pn, totalPages: tp }) => `${pn} / ${tp}`}
        fixed
      />
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════ *
 *  PDF DOCUMENT                                                      *
 * ═══════════════════════════════════════════════════════════════════ */

interface LaunchReportPDFProps {
  profile: BusinessProfile;
  assessment: BusinessAssessment;
  roadmapSteps: RoadmapStep[];
  totalEstimatedDuration: string;
  resources: OfficialResource[];
  generationDate: string;
}

export default function LaunchReportPDF({
  profile,
  assessment,
  roadmapSteps,
  totalEstimatedDuration,
  resources,
  generationDate,
}: LaunchReportPDFProps) {
  const statusIsReady = (status: string) =>
    status === "completed" || status === "in-progress";

  return (
    <Document
      title="Kitchen2Company Launch Report"
      author="Kitchen2Company"
      subject={`Launch Report for ${profile.businessTypeLabel} business`}
    >
      {/* ═══════════════════════════════════════════════════════════ *
       *  COVER PAGE                                                 *
       * ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverBadge}>
          <Text style={styles.coverBadgeText}>Launch Report</Text>
        </View>
        <Text style={styles.coverTitle}>Your Launch Report</Text>
        <Text style={styles.coverSubtitle}>
          A personalised compliance &amp; launch roadmap for your food business
        </Text>
        <View style={styles.coverDivider} />
        <View style={styles.coverMeta}>
          <Text>{profile.businessTypeLabel} Business</Text>
          <Text style={{ marginTop: 4 }}>{profile.locationLabel}</Text>
          <Text style={{ marginTop: 4 }}>Generated {generationDate}</Text>
          <Text style={{ marginTop: 16, fontWeight: 600 }}>
            Prepared by Kitchen2Company
          </Text>
        </View>
      </Page>

      {/* ═══════════════════════════════════════════════════════════ *
       *  FOUNDER PROFILE                                            *
       * ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <PageFooter generationDate={generationDate} />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionBullet} />
          <Text style={styles.sectionTitle}>Founder Profile</Text>
        </View>

        <View style={styles.grid2}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Business Type</Text>
            <Text style={styles.gridValue}>{profile.businessTypeLabel}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Location</Text>
            <Text style={styles.gridValue}>{profile.locationLabel}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Kitchen Type</Text>
            <Text style={styles.gridValue}>{profile.kitchenTypeLabel}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Sales Channels</Text>
            <Text style={styles.gridValue}>{profile.salesChannelsLabel}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Team Size</Text>
            <Text style={styles.gridValue}>{profile.teamSizeLabel}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Growth Goal</Text>
            <Text style={styles.gridValue}>{profile.growthGoalLabel}</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════ *
         *  BUSINESS ASSESSMENT / STRUCTURE                       *
         * ══════════════════════════════════════════════════════ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBullet} />
          <Text style={styles.sectionTitle}>Business Assessment</Text>
        </View>

        <Text style={styles.subsectionTitle}>
          Recommended Business Structure
        </Text>
        <Text style={styles.tagline}>
          {assessment.recommendedBusinessStructure.tagline}
        </Text>
        <Text style={styles.bodyText}>
          {assessment.recommendedBusinessStructure.description}
        </Text>

        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>Why this structure?</Text>
          <Text style={styles.calloutText}>{assessment.explanation}</Text>
        </View>

        <Text style={[styles.calloutLabel, { marginBottom: 4 }]}>Benefits</Text>
        <View style={styles.prosList}>
          {assessment.recommendedBusinessStructure.pros.map((pro, i) => (
            <View key={i} style={styles.prosItem}>
              <View style={styles.prosBullet} />
              <Text style={styles.prosText}>{pro}</Text>
            </View>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════════ *
         *  REQUIRED REGISTRATIONS                                 *
         * ══════════════════════════════════════════════════════ */}
        <View style={styles.largeSpacer} />
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBullet} />
          <Text style={styles.sectionTitle}>Required Registrations</Text>
        </View>

        <View style={styles.regContainer}>
          {assessment.requiredRegistrations.map((reg) => {
            const ready = statusIsReady(reg.status);
            return (
              <View key={reg.id} style={styles.regCard}>
                <View style={styles.regHeader}>
                  <Text style={styles.regName}>{reg.name}</Text>
                  <Text
                    style={[
                      styles.regStatusBadge,
                      ready ? styles.regStatusReady : styles.regStatusPending,
                    ]}
                  >
                    {reg.status}
                  </Text>
                </View>
                <Text style={styles.regDescription}>{reg.description}</Text>
                <Text style={styles.regTimeline}>Est. {reg.timeline}</Text>
              </View>
            );
          })}
        </View>

        {/* ══════════════════════════════════════════════════════ *
         *  LAUNCH READINESS                                       *
         * ══════════════════════════════════════════════════════ */}
        <View style={styles.largeSpacer} />
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBullet} />
          <Text style={styles.sectionTitle}>Launch Readiness</Text>
        </View>

        <View style={styles.readinessContainer}>
          <View style={styles.readinessScoreBox}>
            <Text style={styles.readinessScoreText}>
              {assessment.launchReadinessScore}%
            </Text>
          </View>
          <Text style={styles.readinessMessage}>
            {assessment.readinessMessage}
          </Text>
        </View>

        <View style={styles.nextActionBox}>
          <Text style={styles.nextActionTitle}>Next Best Action</Text>
          <Text style={styles.nextActionDesc}>
            {assessment.nextBestAction.title} —{" "}
            {assessment.nextBestAction.description}
          </Text>
        </View>

        {/* ══════════════════════════════════════════════════════ *
         *  PERSONALIZED ROADMAP (spans to next page if needed)    *
         * ══════════════════════════════════════════════════════ */}
        <View style={styles.largeSpacer} />
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBullet} />
          <Text style={styles.sectionTitle}>Personalized Roadmap</Text>
        </View>

        <Text style={styles.mutedText}>
          {roadmapSteps.length} steps to launch &middot; Est.{" "}
          {totalEstimatedDuration}
        </Text>

        <View style={styles.roadmapContainer} wrap={false}>
          {roadmapSteps.map((step) => (
            <View key={step.id} style={styles.roadmapStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDuration}>
                    {step.estimatedDuration}
                  </Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════════ *
         *  OFFICIAL GOVERNMENT RESOURCES                          *
         * ══════════════════════════════════════════════════════ */}
        {resources.length > 0 && (
          <>
            <View style={styles.largeSpacer} />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBullet} />
              <Text style={styles.sectionTitle}>
                Official Government Resources
              </Text>
            </View>

            {resources.map((r) => (
              <View key={r.id} style={styles.resourceItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceName}>{r.name}</Text>
                  <Text style={styles.resourceDesc}>{r.description}</Text>
                  <Text style={styles.resourceUrl}>{r.url}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Generated timestamp (inline) ──────────── */}
        <View style={styles.largeSpacer} />
        <Text style={[styles.mutedText, { fontSize: 8 }]}>
          Report generated on {generationDate} by Kitchen2Company.
        </Text>
      </Page>
    </Document>
  );
}