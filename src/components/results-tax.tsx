"use client";

import React from "react";
import { useScenario } from "@/context/ScenarioContext";

// Utility function to format currency with exactly 2 decimal places
const formatCurrency = (value: number): string => {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ResultsTax = () => {
  const { computedResults, computeScenario, loading } = useScenario();

  const handleCompute = async () => {
    await computeScenario();
  };

  const centered = !computedResults && !loading;

  return (
    <section
      id="results-tax"
      className={`min-h-screen px-4 py-6 ${
        centered ? "flex flex-col items-center text-center" : ""
      }`}
    >
      <h2
        className={`scenario-heading mb-6 text-3xl font-bold ${
          centered ? "mx-auto" : ""
        }`}
      >
        Results & Tax Analysis
      </h2>

      <div
        className={`max-w-5xl w-full ${
          centered ? "mx-auto text-center" : "mx-auto"
        }`}
      >
        {/* Calculate Button */}
        <button
          onClick={handleCompute}
          disabled={loading}
          className={`mb-8 bg-dpa-dark-green text-white font-semibold px-8 py-3 rounded-xl 
            hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-all duration-200 shadow-md hover:shadow-lg ${
              centered ? "mx-auto" : ""
            }`}
        >
          {loading ? "Calculating..." : "Calculate Scenario"}
        </button>

        {/* Warnings */}
        {computedResults?.warnings &&
          computedResults.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-400 text-yellow-900 px-5 py-4 rounded-lg mb-8 text-base">
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

        {/* No Results Yet */}
        {centered && (
          <p className="text-xl text-gray-600 py-16">
            Click "Calculate Scenario" to see results.
          </p>
        )}

        {/* RESULTS */}
        {computedResults && (
          <div className="space-y-10 text-left">
            {/* Liquidation Summary */}
            <Card title="Liquidation Summary">
              <GridTwo>
                <DataRow
                  label="Total Sale Proceeds"
                  value={computedResults.totalSaleProceeds}
                />
                <DataRow
                  label="Transaction Fees"
                  value={computedResults.totalTransactionFees}
                  negative
                />
                <DataRow
                  label="§1245 Recapture (Ordinary Income)"
                  value={computedResults.totalSection1245Recapture}
                />
                <DataRow
                  label="§1231 Gain (Capital Gain)"
                  value={computedResults.totalSection1231Gain}
                />
                <DataRow
                  label="Total Tax on Sales"
                  value={computedResults.totalTaxOnSales}
                  negative
                />
                <DataRow
                  label="Net Cash from Liquidation"
                  value={computedResults.netCashFromLiquidation}
                  highlight
                />
              </GridTwo>
            </Card>

            {/* Replacement Summary */}
            <Card title="Replacement Summary">
              <GridTwo>
                <DataRow
                  label="Total Replacement Cost"
                  value={computedResults.totalReplacementCost}
                />
                <DataRow
                  label="Bonus Depreciation"
                  value={computedResults.totalBonusDepreciation}
                />
                <DataRow
                  label="§179 Deduction"
                  value={computedResults.totalSection179}
                />
                <DataRow
                  label="MACRS First Year"
                  value={computedResults.totalMacrsFirstYear}
                />
                <DataRow
                  label="Total First-Year Deductions"
                  value={computedResults.totalFirstYearDeductions}
                  highlight
                />
                <DataRow
                  label="Tax Savings from Deductions"
                  value={computedResults.taxSavingsFromDeductions}
                  positive
                />
              </GridTwo>
            </Card>

            {/* Net Cash Flow Analysis */}
            <Card title="Net Cash Flow Analysis">
              <div className="space-y-4">
                <FlowRow
                  label="Net Cash from Liquidation"
                  value={computedResults.netCashFromLiquidation}
                />
                <FlowRow
                  label="Tax Savings from Deductions"
                  prefix="+"
                  value={computedResults.taxSavingsFromDeductions}
                />
                <FlowRow
                  label="Cash Required for Replacements"
                  prefix="-"
                  value={computedResults.cashRequiredForReplacements}
                  negative
                />

                {/* Net Cash Flow Total */}
                <div className="flex justify-between items-center py-5 bg-gray-50 rounded-lg px-5 mt-6 shadow-inner border border-gray-200">
                  <span className="text-xl font-semibold text-gray-800">
                    NET CASH FLOW:
                  </span>
                  <span
                    className={`text-3xl font-extrabold tracking-tight ${
                      computedResults.netCashFlow >= 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {computedResults.netCashFlow >= 0 ? "+" : "-"}$
                    {formatCurrency(
                      Math.abs(computedResults.netCashFlow)
                    )}
                  </span>
                </div>
              </div>
            </Card>

            {/* Sale Details */}
            {computedResults.saleDetails?.length > 0 && (
              <Card title="Sale Details">
                <div className="space-y-6">
                  {computedResults.saleDetails.map(
                    (sale: any, idx: number) => (
                      <DetailBox
                        key={idx}
                        color="blue"
                        title={sale.assetName}
                      >
                        <DetailGrid>
                          <Detail
                            label="Sale Price"
                            value={sale.salePrice}
                          />
                          <Detail
                            label="Adjusted Basis"
                            value={sale.adjustedBasis}
                          />
                          <Detail
                            label="Total Gain"
                            value={sale.totalGain}
                          />
                          <Detail
                            label="Net Proceeds"
                            value={sale.netProceedsAfterTax}
                          />
                        </DetailGrid>

                        {sale.notes?.length > 0 && (
                          <ul className="text-base text-gray-700 mt-3 leading-relaxed space-y-1">
                            {sale.notes.map(
                              (n: string, nIdx: number) => (
                                <li key={nIdx}>• {n}</li>
                              )
                            )}
                          </ul>
                        )}
                      </DetailBox>
                    )
                  )}
                </div>
              </Card>
            )}

            {/* Replacement Details */}
            {computedResults.replacementDetails?.length > 0 && (
              <Card title="Replacement Details">
                <div className="space-y-6">
                  {computedResults.replacementDetails.map(
                    (repl: any, idx: number) => (
                      <DetailBox
                        key={idx}
                        color="green"
                        title={repl.assetName}
                      >
                        <DetailGrid>
                          <Detail label="Cost" value={repl.cost} />
                          <Detail
                            label="Method"
                            value={repl.methodUsed}
                            raw
                          />
                          <Detail
                            label="Depreciable Basis"
                            value={repl.depreciableBasis}
                          />
                          <Detail
                            label="First-Year Deduction"
                            value={repl.totalFirstYearDeduction}
                          />
                        </DetailGrid>

                        {repl.notes?.length > 0 && (
                          <ul className="text-base text-gray-700 mt-3 leading-relaxed space-y-1">
                            {repl.notes.map(
                              (n: string, nIdx: number) => (
                                <li key={nIdx}>• {n}</li>
                              )
                            )}
                          </ul>
                        )}
                      </DetailBox>
                    )
                  )}
                </div>
              </Card>
            )}

            <p className="text-center text-gray-500 text-sm mt-10">
              Calculated at{" "}
              {new Date(
                computedResults.calculatedAt
              ).toLocaleString()}{" "}
              • Tax Year {computedResults.taxYear}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------
   COMPONENTS
--------------------------------------------------*/

const Card = ({ title, children }: any) => (
  <div className="bg-white border rounded-xl shadow-sm p-8 space-y-4">
    <h3 className="text-2xl font-semibold mb-2 text-gray-800 tracking-tight">
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const GridTwo = ({ children }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);

const DataRow = ({ label, value, highlight, positive, negative }: any) => {
  const color = positive
    ? "text-green-700"
    : negative
    ? "text-red-700"
    : "text-gray-900";

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200">
      <span
        className={`text-lg ${
          highlight ? "font-bold" : "font-medium"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-lg ${
          highlight ? "font-bold" : "font-semibold"
        } ${color}`}
      >
        ${formatCurrency(value)}
      </span>
    </div>
  );
};

const FlowRow = ({ label, value, prefix = "", negative }: any) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200">
    <span className="text-lg font-medium text-gray-800">{label}:</span>
    <span
      className={`text-lg font-semibold ${
        negative ? "text-red-700" : "text-green-700"
      }`}
    >
      {prefix}${formatCurrency(value)}
    </span>
  </div>
);

const DetailBox = ({ title, children, color }: any) => (
  <div
    className={`rounded-xl border border-${color}-300 p-5 bg-white shadow-sm`}
  >
    <p className="font-semibold text-xl mb-3">{title}</p>
    {children}
  </div>
);

const DetailGrid = ({ children }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg text-gray-800 leading-relaxed">
    {children}
  </div>
);

const Detail = ({ label, value, raw = false }: any) => (
  <span className="text-base sm:text-lg leading-snug">
    <span className="font-medium text-gray-800">{label}: </span>
    {!raw ? `$${formatCurrency(value)}` : value}
  </span>
);

export default ResultsTax;
