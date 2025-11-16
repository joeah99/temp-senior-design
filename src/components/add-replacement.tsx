"use client";

import React, { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";

const MethodHelp = ({ method }: { method: string }) => {
  if (method === "BONUS") {
    return <p className="text-xs text-gray-500">Bonus: immediate full expensing (100% by default) of business-use portion.</p>;
  }
  if (method === "SECTION_179") {
    return <p className="text-xs text-gray-500">§179: immediate deduction up to the §179 limit (subject to cap).</p>;
  }
  if (method === "MACRS_GDS") {
    return <p className="text-xs text-gray-500">MACRS GDS: accelerated depreciation (simplified 5-year, first-year ~20%).</p>;
  }
  return <p className="text-xs text-gray-500">MACRS ADS: straight-line (simplified 5-year in this model).</p>;
};

const AddReplacement = () => {
  const { replacementAssets, addReplacementAsset, removeReplacementAsset, taxSettings, setTaxSettings } = useScenario();

  const [name, setName] = useState("");
  const [cost, setCost] = useState<number | "">("");
  const [method, setMethod] = useState<ReplacementMethod>("BONUS");
  const [businessUse, setBusinessUse] = useState<number>(100);
  const [inServiceMonth, setInServiceMonth] = useState<string>("");

  type ReplacementMethod = "BONUS" | "SECTION_179" | "MACRS_GDS" | "MACRS_ADS";

  const handleAdd = () => {
    if (!name || !cost || Number(cost) <= 0) return alert("Provide a name and positive cost.");
    const id = typeof (window as any).crypto !== "undefined" && (window as any).crypto.randomUUID
      ? (window as any).crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    addReplacementAsset({
      id,
      name,
      cost: Number(cost),
      method,
      businessUse,
      inServiceMonth,
    });

    setName("");
    setCost("");
    setMethod("BONUS");
    setBusinessUse(100);
    setInServiceMonth("");
  };

  return (
    <section id="replacement-purchases" className="min-h-screen">
      <h2 className="scenario-heading">Add Replacement Purchases</h2>

      <div className="bg-white border rounded-lg p-4 max-w-3xl mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="text-sm text-gray-600">Asset Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="text-sm text-gray-600">Cost</label>
            <input
              type="number"
              value={cost as any}
              onChange={(e) => setCost(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border p-2 rounded"
              min={0}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as ReplacementMethod)} className="w-full border p-2 rounded">
              <option value="BONUS">Bonus 100%</option>
              <option value="SECTION_179">§179</option>
              <option value="MACRS_GDS">MACRS GDS</option>
              <option value="MACRS_ADS">MACRS ADS</option>
            </select>
            <MethodHelp method={method} />
          </div>

          <div>
            <label className="text-sm text-gray-600">Business Use %</label>
            <input type="number" value={businessUse} onChange={(e) => setBusinessUse(Number(e.target.value))} className="w-full border p-2 rounded" min={0} max={100} />
          </div>

          <div>
            <label className="text-sm text-gray-600">In-service month</label>
            <input type="month" value={inServiceMonth} onChange={(e) => setInServiceMonth(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div className="flex items-end">
            <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded">
              Add Replacement
            </button>
          </div>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="bg-white border rounded-lg p-4 max-w-3xl mb-6">
        <h3 className="font-semibold mb-2">Tax Settings</h3>
        <p className="text-xs text-gray-500 mb-3">Enter the marginal tax rate used to compute tax savings from depreciation (example: enter 0.37 for 37%).</p>
        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-sm text-gray-600">Marginal Rate (decimal)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={taxSettings.marginalRate}
              onChange={(e) => setTaxSettings({ marginalRate: Number(e.target.value) })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">§179 Limit</label>
            <input
              type="number"
              value={taxSettings.section179Limit}
              onChange={(e) => setTaxSettings({ section179Limit: Number(e.target.value) })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Bonus %</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={taxSettings.bonusPercent}
              onChange={(e) => setTaxSettings({ bonusPercent: Number(e.target.value) })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
      </div>

      {/* List of replacements */}
      <div className="space-y-3 max-w-3xl">
        {replacementAssets.length === 0 ? (
          <p className="text-gray-600">No replacement purchases added yet.</p>
        ) : (
          replacementAssets.map((r) => (
            <div key={r.id} className="bg-white border rounded p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-sm text-gray-600">
                  ${r.cost.toLocaleString()} • {r.method} • {r.businessUse}% • {r.inServiceMonth || "no month"}
                </div>
              </div>
              <div>
                <button onClick={() => removeReplacementAsset(r.id)} className="text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default AddReplacement;
