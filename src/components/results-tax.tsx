"use client";

import React from "react";
import { useScenario } from "@/context/ScenarioContext";

// --- Helper Functions ---
const formatCurrency = (value: number): string => {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0, // Simplified for cleaner look
    maximumFractionDigits: 0,
  });
};

const formatMethodName = (method: string) => {
  switch (method) {
    case "BONUS":
      return "Bonus Depreciation";
    case "SECTION_179":
      return "§179 Expensing";
    case "MACRS_GDS":
      return "MACRS GDS";
    case "MACRS_ADS":
      return "MACRS ADS";
    case "AUTO":
      return "Auto-Max";
    default:
      return method?.replace(/_/g, " ") || "-";
  }
};

const getDynamicColor = (value: number) => {
  if (value > 0) return "text-green-700";
  if (value < 0) return "text-red-700";
  return "text-gray-900";
};

// --- Components ---

const DataRow = ({ label, value, highlight, colorClass, isText = false }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className={`text-sm ${highlight ? "font-semibold text-gray-800" : "text-gray-600"}`}>
      {label}
    </span>
    <span
      className={`text-sm ${highlight ? "font-bold" : "font-medium"} ${colorClass || "text-gray-900"
        }`}
    >
      {isText ? value : `$${formatCurrency(value)}`}
    </span>
  </div>
);

// ... (SummaryCard and DetailCard remain unchanged) ...
const SummaryCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6">
    <h3 className="font-bold text-gray-800 text-lg mb-4 border-b border-gray-100 pb-2">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const DetailCard = ({
  title,
  subtitle,
  children,
  badgeText,
  badgeColor,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  badgeText?: string;
  badgeColor?: string;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-bold text-gray-800">{title}</h4>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      {badgeText && (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}
        >
          {badgeText}
        </span>
      )}
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

const ResultsTax = () => {
  const { computedResults, computeScenario, loading, taxSettings } = useScenario();

  const handleCompute = async () => {
    await computeScenario();
  };
  // ...
  {/* Missing Tax Rate Warning */ }
  {
    !computedResults?.warnings?.some(w => w.includes("tax rate")) && (!taxSettings.marginalRate || Number(taxSettings.marginalRate) === 0) && (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm">
        <p className="font-bold">Missing Tax Rate</p>
        <p>Please set your marginal tax rate on the previous page to ensure accurate tax calculations.</p>
      </div>
    )
  }

  const hasResults = computedResults && !loading;

  // --- HOMEPAGE / EMPTY STATE (Original Design) ---
  if (!hasResults && !loading) {
    return (
      <section
        id="results-tax"
        className="min-h-[50vh] px-4 py-4 flex flex-col items-center justify-center text-center"
      >
        <h2 className="scenario-heading mb-6 text-3xl font-bold mx-auto">
          Results & Tax Analysis
        </h2>

        <div className="max-w-5xl w-full mx-auto text-center">
          <button
            onClick={handleCompute}
            disabled={loading}
            className="mb-8 bg-dpa-dark-green text-white font-semibold px-8 py-3 rounded-xl 
            hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-all duration-200 shadow-md hover:shadow-lg mx-auto"
          >
            {loading ? "Calculating..." : "Calculate Scenario"}
          </button>

          {computedResults?.warnings &&
            computedResults.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-900 px-5 py-4 rounded-lg mb-8 text-base text-left max-w-2xl mx-auto">
                <p className="font-semibold mb-2 text-lg">Warnings:</p>
                <ul className="list-disc list-inside space-y-1">
                  {computedResults.warnings?.map(
                    (w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    )
                  )}
                </ul>
              </div>
            )}

          <p className="text-xl text-gray-600 py-16">
            Click "Calculate Scenario" to see results.
          </p>
        </div>
      </section>
    );
  }

  // --- RESULTS VIEW (New Design) ---
  return (
    <section id="results-tax" className="min-h-screen max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="scenario-heading mb-0">Results & Tax Analysis</h2>

        <button
          onClick={handleCompute}
          disabled={loading}
          className="bg-dpa-dark-green text-white font-semibold px-6 py-2 rounded shadow hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm"
        >
          {loading ? "Calculating..." : "Recalculate Results"}
        </button>
      </div>

      {/* Warnings (Compact Version) */}
      {computedResults?.warnings && computedResults.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
          <p className="font-bold mb-1">Attention Required:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {computedResults.warnings.map((w: string, idx: number) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Tax Rate Warning */}
      {!computedResults?.warnings?.some(w => w.includes("tax rate")) && (!taxSettings.marginalRate || Number(taxSettings.marginalRate) === 0) && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 text-sm">
          <p className="font-bold">Missing Tax Rate</p>
          <p>Please set your marginal tax rate on the previous page to ensure accurate tax calculations.</p>
        </div>
      )}

      {hasResults && (
        <div className="space-y-8 animate-in fade-in duration-500">

          {/* ---------------- TOP LEVEL SUMMARIES ---------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Liquidation Summary */}
            <SummaryCard title="Liquidation (Sales)">
              <DataRow label="Total Sale Proceeds" value={computedResults.totalSaleProceeds} />
              <DataRow label="Transaction Fees" value={computedResults.totalTransactionFees} />
              <DataRow label="§1245 Recapture (Ordinary)" value={computedResults.totalSection1245Recapture} />
              <DataRow label="§1231 Gain (Capital)" value={computedResults.totalSection1231Gain} />
              <DataRow label="Est. Tax on Sales" value={computedResults.totalTaxOnSales} />
              <div className="mt-2 pt-2 border-t border-gray-200">
                <DataRow label="Net Cash from Sales" value={computedResults.netCashFromLiquidation} highlight colorClass={getDynamicColor(computedResults.netCashFromLiquidation)} />
              </div>
            </SummaryCard>

            {/* Replacement Summary */}
            <SummaryCard title="Replacements (Purchases)">
              <DataRow label="Total Replacement Cost" value={computedResults.totalReplacementCost} />
              <DataRow label="Bonus Depreciation" value={computedResults.totalBonusDepreciation} />
              <DataRow label="§179 Deduction" value={computedResults.totalSection179} />
              <DataRow label="MACRS (Year 1)" value={computedResults.totalMacrsFirstYear} />
              <DataRow label="Total First-Year Write-off" value={computedResults.totalFirstYearDeductions} highlight />
              <div className="mt-2 pt-2 border-t border-gray-200">
                <DataRow label="Est. Tax Savings" value={computedResults.taxSavingsFromDeductions} highlight colorClass={getDynamicColor(computedResults.taxSavingsFromDeductions)} />
              </div>
            </SummaryCard>
          </div>

          {/* ---------------- NET CASH FLOW ---------------- */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Net Cash Flow Analysis</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="block text-gray-500 text-xs uppercase font-semibold">Cash In (Sales)</span>
                <span className={`text-lg font-bold ${getDynamicColor(computedResults.netCashFromLiquidation)}`}>${formatCurrency(computedResults.netCashFromLiquidation)}</span>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="block text-gray-500 text-xs uppercase font-semibold">Cash Out (Purchases)</span>
                <span className="text-lg font-bold text-red-700">-${formatCurrency(computedResults.cashRequiredForReplacements)}</span>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <span className="block text-gray-500 text-xs uppercase font-semibold">Tax Savings (In)</span>
                <span className={`text-lg font-bold ${getDynamicColor(computedResults.taxSavingsFromDeductions)}`}>+${formatCurrency(computedResults.taxSavingsFromDeductions)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
              <span className="font-bold text-gray-800 text-lg">NET CASH IMPACT</span>
              <span className={`text-2xl font-extrabold ${computedResults.netCashFlow >= 0 ? "text-green-700" : "text-red-700"}`}>
                {computedResults.netCashFlow >= 0 ? "+" : "-"}${formatCurrency(Math.abs(computedResults.netCashFlow))}
              </span>
            </div>
          </div>

          {/* ---------------- DETAILED BREAKDOWNS ---------------- */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Sale Details */}
            <div>
              <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Sale Details</h4>
              {computedResults.saleDetails?.length === 0 && <p className="text-sm text-gray-500 italic">No assets sold.</p>}
              <div className="space-y-3">
                {computedResults.saleDetails.map((sale: any, idx: number) => (
                  <DetailCard
                    key={idx}
                    title={sale.assetName}
                    badgeText="SOLD"
                    badgeColor="bg-red-50 text-red-700 border-red-200"
                  >
                    <DataRow label="Sale Price" value={sale.salePrice} />
                    <DataRow label="Adj. Basis" value={sale.adjustedBasis} />
                    <DataRow label="Total Gain" value={sale.totalGain} highlight />
                    <DataRow label="Net Proceeds" value={sale.netProceedsAfterTax} highlight colorClass={getDynamicColor(sale.netProceedsAfterTax)} />
                  </DetailCard>
                ))}
              </div>
            </div>

            {/* Replacement Details */}
            <div>
              <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Purchase Details</h4>
              {computedResults.replacementDetails?.length === 0 && <p className="text-sm text-gray-500 italic">No assets purchased.</p>}
              <div className="space-y-3">
                {computedResults.replacementDetails.map((repl: any, idx: number) => (
                  <DetailCard
                    key={idx}
                    title={repl.assetName}
                    badgeText="BOUGHT"
                    badgeColor="bg-green-50 text-green-700 border-green-200"
                  >
                    <DataRow label="Cost" value={repl.cost} />
                    <DataRow label="Depreciation Method" value={formatMethodName(repl.methodUsed)} isText />
                    <DataRow label="Depreciable Basis" value={repl.depreciableBasis} />
                    <DataRow label="Year 1 Deduction" value={repl.totalFirstYearDeduction} highlight colorClass={getDynamicColor(repl.totalFirstYearDeduction)} />
                  </DetailCard>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Calculated on {new Date(computedResults.calculatedAt).toLocaleString()} • Tax Year {computedResults.taxYear}
          </p>

        </div>
      )}
    </section>
  );
};

export default ResultsTax;
