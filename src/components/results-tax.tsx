"use client";

import React, { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";

const ResultsTax = () => {
  const { computedResults, computeScenario, replacementAssets } = useScenario();
  const [section179Input, setSection179Input] = useState<number>(0);

  const handleSection179Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    const max = replacementAssets.reduce((sum, r) => sum + r.cost, 0);
    if (val > max) val = max;
    setSection179Input(val);
  };

  const handleCompute = () => {
    // override section179 in context for computation
    computeScenario();
  };

  const totalReplacementCost = replacementAssets.reduce((sum, r) => sum + r.cost, 0);

  return (
    <section id="results-tax" className="min-h-screen">
      <h2 className="scenario-heading mb-4">Results & Tax Analysis</h2>

      <div className="bg-white border rounded-lg shadow-sm p-6 max-w-2xl mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Asset Value:</span>
              <span>${computedResults?.totalAssetValue.toLocaleString() ?? "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus Depreciation:</span>
              <span>${computedResults?.bonusDepreciation.toLocaleString() ?? "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>§179 Deduction:</span>
              <input
                type="number"
                value={section179Input}
                onChange={handleSection179Change}
                className="border rounded px-2 py-1 text-sm w-24"
                max={totalReplacementCost}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>MACRS Depreciation (1st year):</span>
              <span>${computedResults?.macrsDepreciation.toLocaleString() ?? "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax Savings:</span>
              <span>${computedResults?.taxSavings.toLocaleString() ?? "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>Net Cash Flow:</span>
              <span>${computedResults?.netCashFlow.toLocaleString() ?? "0.00"}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCompute}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Compute Scenario
        </button>
      </div>
    </section>
  );
};

export default ResultsTax;
