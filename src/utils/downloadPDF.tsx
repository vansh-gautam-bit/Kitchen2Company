/* ═══════════════════════════════════════════════════════════════════ *
 *  Download PDF Utility                                            *
 *                                                                  *
 *  Renders the LaunchReport PDF document to a blob and triggers    *
 *  a client-side download.                                         *
 * ═══════════════════════════════════════════════════════════════════ */

import { pdf } from "@react-pdf/renderer";
import LaunchReportPDF from "../reports/LaunchReportPDF";
import type { BusinessProfile, BusinessAssessment } from "../types/business";
import type { RoadmapStep } from "../types/roadmap";
import type { OfficialResource } from "../types/research";

export interface DownloadPDFOptions {
  profile: BusinessProfile;
  assessment: BusinessAssessment;
  roadmapSteps: RoadmapStep[];
  totalEstimatedDuration: string;
  resources: OfficialResource[];
}

/**
 * Generate and download the Launch Report as a PDF file.
 *
 * Returns `true` on success, `false` on failure.
 */
export async function downloadLaunchReport(
  options: DownloadPDFOptions,
): Promise<boolean> {
  const { profile, assessment, roadmapSteps, totalEstimatedDuration, resources } = options;

  const now = new Date();
  const generationDate = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Build a filename e.g. "Kitchen2Company-Launch-Report-14-Apr-2026.pdf"
  const dateSlug = now
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/\s+/g, "-");
  const filename = `Kitchen2Company-Launch-Report-${dateSlug}.pdf`;

  try {
    const pdfInstance = pdf(
      <LaunchReportPDF
        profile={profile}
        assessment={assessment}
        roadmapSteps={roadmapSteps}
        totalEstimatedDuration={totalEstimatedDuration}
        resources={resources}
        generationDate={generationDate}
      />,
    );

    const blob = await pdfInstance.toBlob();
    const url = URL.createObjectURL(blob);

    // Trigger client-side download
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 10_000);

    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    return false;
  }
}