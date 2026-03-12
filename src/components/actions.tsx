"use client";

import React, { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { exportResultsToCSV } from "@/utils/csv-utils";
import {
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Truck,
  Landmark,
  Bot,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionStatus = "ready" | "unavailable" | "coming_soon";

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: ActionStatus }) => {
  const map: Record<ActionStatus, { label: string; classes: string }> = {
    ready: { label: "Ready", classes: "bg-green-50 text-green-700 border-green-200" },
    unavailable: { label: "No Results", classes: "bg-amber-50 text-amber-700 border-amber-200" },
    coming_soon: { label: "Coming Soon", classes: "bg-purple-50 text-purple-700 border-purple-200" },
  };
  const { label, classes } = map[status];
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${classes}`}>
      {label}
    </span>
  );
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: ActionStatus;
  ctaLabel: string;
  onAction?: () => void;
  loading?: boolean;
}

const ActionCard = ({
  icon,
  title,
  description,
  status,
  ctaLabel,
  onAction,
  loading = false,
}: ActionCardProps) => {
  const canAct = status === "ready" && !loading;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 rounded-lg bg-dpa-dark-green/10 text-dpa-dark-green">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* CTA */}
      <button
        onClick={canAct ? onAction : undefined}
        disabled={!canAct || loading}
        className={`w-full text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200
          ${canAct
            ? "bg-dpa-dark-green text-white hover:bg-green-800 shadow-sm hover:shadow-md"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {loading ? "Generating…" : ctaLabel}
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Actions = () => {
  const { computedResults } = useScenario();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const hasResults = !!(computedResults && Object.keys(computedResults).length > 0);
  const taxYear = computedResults?.taxYear ?? "—";

  const handleCSV = () => {
    exportResultsToCSV(computedResults);
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      const { exportResultsToPDF } = await import("@/utils/pdf-utils");
      await exportResultsToPDF(computedResults);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scenarios/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_data: computedResults }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate AI explanation");
      }
      const data = await res.json();
      setAiExplanation(data.explanation);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An error occurred while generating the summary.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section id="actions" className="min-h-screen max-w-4xl">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="scenario-heading">Actions</h2>
        <p className="text-sm text-gray-500 mt-1">
          Turn your modeled scenario into real-world steps.
        </p>
      </div>

      {/* No-results banner */}
      {!hasResults && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 mb-6 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">No scenario results yet</p>
            <p className="text-xs mt-0.5">
              Navigate to <strong>Results &amp; Tax</strong> and click{" "}
              <strong>Calculate Scenario</strong> to unlock export actions.
            </p>
          </div>
        </div>
      )}

      {/* Tax Year badge */}
      {hasResults && (
        <div className="inline-flex items-center gap-2 bg-dpa-dark-green/10 text-dpa-dark-green text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Scenario calculated — Tax Year {taxYear}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard
          icon={<FileSpreadsheet className="w-5 h-5" />}
          title="Download Banker-Ready CSV"
          description="Export a clean, audit-ready spreadsheet with sale details, replacement data, net cash flow, and statute references."
          status={hasResults ? "ready" : "unavailable"}
          ctaLabel="Download CSV"
          onAction={handleCSV}
        />

        <ActionCard
          icon={<FileText className="w-5 h-5" />}
          title="Download PDF Audit Pack"
          description="Generate a branded, multi-section PDF with full scenario data — ready to share with lenders, CPAs, or auditors."
          status={hasResults ? "ready" : "unavailable"}
          ctaLabel={pdfLoading ? "Generating…" : "Download PDF"}
          onAction={handlePDF}
          loading={pdfLoading}
        />

        <ActionCard
          icon={<Truck className="w-5 h-5" />}
          title="Consign to DPA Auctions"
          description="Send your selected assets directly to DPA for consignment. We'll automatically build the listing draft with your equipment details."
          status="coming_soon"
          ctaLabel="Send to DPA"
        />

        <ActionCard
          icon={<Landmark className="w-5 h-5" />}
          title="Request Refinance Quote"
          description="Instantly send your scenario data to our lending partners to get competitive refinance rates for your replacement purchases."
          status="coming_soon"
          ctaLabel="Get Quote"
        />
      </div>

      {/* AI Explanation Section */}
      {hasResults && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">AI Scenario Summary</h3>
              <p className="text-sm text-gray-500">
                Get a natural language breakdown of your scenario's financial impact.
              </p>
            </div>
          </div>

          {!aiExplanation && !aiLoading && (
            <button
              onClick={handleGenerateAI}
              className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-2.5 px-5 rounded-lg transition-all shadow-sm"
            >
              <Bot className="w-5 h-5" />
              Generate Summary
            </button>
          )}

          {aiLoading && (
            <div className="flex items-center gap-3 text-indigo-600 font-medium py-3">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing scenario data...
            </div>
          )}

          {aiError && (
            <div className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-sm mt-3">
              {aiError}
            </div>
          )}

          {aiExplanation && (
            <div className="mt-4 animate-in fade-in duration-500">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {aiExplanation}
              </div>
              <button
                onClick={() => setAiExplanation(null)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-800 underline transition"
              >
                Clear Summary
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Actions;