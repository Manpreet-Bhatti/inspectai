import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { Finding } from "@/types";

export interface ReportData {
  inspectionId: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  createdAt: string;
  inspectorEmail: string;
  findings: Pick<
    Finding,
    | "title"
    | "description"
    | "category"
    | "severity"
    | "location"
    | "costEstimate"
    | "costMin"
    | "costMax"
    | "status"
  >[];
  reportType: "full" | "summary" | "defects";
  totalCost: number;
  summary: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#dc2626",
  MAJOR: "#ea580c",
  MINOR: "#ca8a04",
  COSMETIC: "#2563eb",
  INFO: "#6b7280",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    paddingTop: 40,
    paddingBottom: 60,
    paddingLeft: 40,
    paddingRight: 40,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    borderBottomStyle: "solid",
  },
  logoText: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#3b82f6",
  },
  logoSub: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  reportTypeLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
  },
  generatedAt: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 3,
  },
  // Section
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
  },
  // Property details
  detailRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  detailLabel: {
    width: 110,
    color: "#6b7280",
  },
  detailValue: {
    flex: 1,
    color: "#111827",
  },
  // Summary grid
  summaryGrid: {
    flexDirection: "row",
    marginBottom: 10,
  },
  summaryCell: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginRight: 8,
  },
  summaryCellLast: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  summaryCount: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  // Cost summary
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    borderBottomStyle: "solid",
  },
  costLabel: {
    color: "#4b5563",
  },
  costValue: {
    fontFamily: "Helvetica-Bold",
  },
  costTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
  },
  costTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  costTotalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  // Findings
  finding: {
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    borderRadius: 4,
  },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  findingTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    flex: 1,
    marginRight: 8,
  },
  severityBadge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 2,
    color: "#ffffff",
  },
  findingDescription: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  findingMeta: {
    flexDirection: "row",
  },
  findingMetaItem: {
    fontSize: 8,
    color: "#9ca3af",
    marginRight: 12,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  noFindings: {
    color: "#6b7280",
    fontStyle: "italic",
    paddingTop: 4,
  },
});

function formatCurrency(n: number | null | undefined) {
  if (!n) return "—";
  return `$${n.toLocaleString()}`;
}

function formatPropertyType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getReportTypeLabel(type: string) {
  if (type === "full") return "Full Inspection Report";
  if (type === "summary") return "Summary Report";
  if (type === "defects") return "Defects Report";
  return "Inspection Report";
}

interface ReportDocumentProps {
  data: ReportData;
}

function ReportDocument({ data }: ReportDocumentProps) {
  const { findings, reportType } = data;

  const critical = findings.filter((f) => f.severity === "CRITICAL").length;
  const major = findings.filter((f) => f.severity === "MAJOR").length;
  const minor = findings.filter((f) => f.severity === "MINOR").length;
  const cosmetic = findings.filter((f) => f.severity === "COSMETIC").length;

  const displayedFindings =
    reportType === "defects"
      ? findings.filter((f) =>
          ["CRITICAL", "MAJOR", "MINOR"].includes(f.severity)
        )
      : reportType === "full"
        ? findings
        : [];

  const findingsBySeverity = {
    CRITICAL: findings.filter(
      (f) => f.severity === "CRITICAL" && f.costEstimate
    ),
    MAJOR: findings.filter((f) => f.severity === "MAJOR" && f.costEstimate),
    MINOR: findings.filter((f) => f.severity === "MINOR" && f.costEstimate),
  };

  return (
    <Document
      title={`${data.title} - ${getReportTypeLabel(reportType)}`}
      author="InspectAI"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>InspectAI</Text>
            <Text style={styles.logoSub}>
              AI-Powered Property Inspection Platform
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTypeLabel}>
              {getReportTypeLabel(reportType)}
            </Text>
            <Text style={styles.generatedAt}>
              Generated {formatDate(new Date().toISOString())}
            </Text>
          </View>
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Inspection Title</Text>
            <Text style={styles.detailValue}>{data.title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>
              {data.address}, {data.city}, {data.state} {data.zipCode}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Property Type</Text>
            <Text style={styles.detailValue}>
              {formatPropertyType(data.propertyType)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Inspection Date</Text>
            <Text style={styles.detailValue}>{formatDate(data.createdAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Inspector</Text>
            <Text style={styles.detailValue}>{data.inspectorEmail}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={{ fontSize: 9, color: "#4b5563", marginBottom: 10 }}>
            {data.summary}
          </Text>

          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCell, { backgroundColor: "#fef2f2" }]}>
              <Text style={[styles.summaryCount, { color: "#dc2626" }]}>
                {critical}
              </Text>
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
            <View style={[styles.summaryCell, { backgroundColor: "#fff7ed" }]}>
              <Text style={[styles.summaryCount, { color: "#ea580c" }]}>
                {major}
              </Text>
              <Text style={styles.summaryLabel}>Major</Text>
            </View>
            <View style={[styles.summaryCell, { backgroundColor: "#fefce8" }]}>
              <Text style={[styles.summaryCount, { color: "#ca8a04" }]}>
                {minor}
              </Text>
              <Text style={styles.summaryLabel}>Minor</Text>
            </View>
            <View
              style={[styles.summaryCellLast, { backgroundColor: "#eff6ff" }]}
            >
              <Text style={[styles.summaryCount, { color: "#2563eb" }]}>
                {cosmetic}
              </Text>
              <Text style={styles.summaryLabel}>Cosmetic</Text>
            </View>
          </View>
        </View>

        {/* Cost Breakdown */}
        {data.totalCost > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cost Estimate Breakdown</Text>
            {(["CRITICAL", "MAJOR", "MINOR"] as const).map((sev) => {
              const items = findingsBySeverity[sev];
              if (items.length === 0) return null;
              const subtotal = items.reduce(
                (s, f) => s + (f.costEstimate ?? 0),
                0
              );
              return (
                <View key={sev} style={styles.costRow}>
                  <Text style={styles.costLabel}>
                    {sev.charAt(0) + sev.slice(1).toLowerCase()} issues (
                    {items.length})
                  </Text>
                  <Text style={styles.costValue}>
                    {formatCurrency(subtotal)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.costTotalRow}>
              <Text style={styles.costTotalLabel}>Total Estimated Cost</Text>
              <Text style={styles.costTotalValue}>
                {formatCurrency(data.totalCost)}
              </Text>
            </View>
          </View>
        )}

        {/* Findings List (full + defects only) */}
        {displayedFindings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {reportType === "defects" ? "Defect Details" : "All Findings"} (
              {displayedFindings.length})
            </Text>
            {displayedFindings.map((f, i) => (
              <View key={i} style={styles.finding}>
                <View style={styles.findingHeader}>
                  <Text style={styles.findingTitle}>{f.title}</Text>
                  <Text
                    style={[
                      styles.severityBadge,
                      {
                        backgroundColor:
                          SEVERITY_COLORS[f.severity] ?? "#6b7280",
                      },
                    ]}
                  >
                    {f.severity}
                  </Text>
                </View>
                <Text style={styles.findingDescription}>{f.description}</Text>
                <View style={styles.findingMeta}>
                  <Text style={styles.findingMetaItem}>
                    Category:{" "}
                    {f.category.charAt(0) + f.category.slice(1).toLowerCase()}
                  </Text>
                  {f.location && (
                    <Text style={styles.findingMetaItem}>
                      Location: {f.location}
                    </Text>
                  )}
                  {f.costEstimate && (
                    <Text style={styles.findingMetaItem}>
                      Est. Cost: {formatCurrency(f.costEstimate)}
                      {f.costMin && f.costMax
                        ? ` (${formatCurrency(f.costMin)}–${formatCurrency(f.costMax)})`
                        : ""}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            InspectAI — Confidential Inspection Report
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export async function renderReport(data: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument data={data} />);
}
