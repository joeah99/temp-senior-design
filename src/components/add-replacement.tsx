"use client";

import React, { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";

const onlyDigits = (str: string) => str.replace(/\D/g, "");
const formatWithCommas = (num: number | "") =>
  num === "" ? "" : num.toLocaleString();

type ReplacementMethod = "BONUS" | "SECTION_179" | "MACRS_GDS" | "MACRS_ADS" | "AUTO";

const MethodHelp = ({ method }: { method: ReplacementMethod }) => {
  const helpText =
    method === "AUTO"
      ? "Auto-Max: Automatically selects the method(s) that yield the highest first-year deduction."
      : method === "BONUS"
        ? "Bonus: immediate deduction of Bonus % of depreciable basis."
        : method === "SECTION_179"
          ? "§179: immediate deduction of depreciable basis up to the §179 limit."
          : method === "MACRS_GDS"
            ? "MACRS GDS: accelerated depreciation (simplified 5-year, first-year ~20%)."
            : "MACRS ADS: straight-line depreciation (simplified 5-year, first-year ~10%).";

  return <p className="text-sm text-gray-500 mt-1">{helpText}</p>;
};

const AddReplacement = () => {
  const {
    replacementAssets,
    addReplacementAsset,
    removeReplacementAsset,
    taxSettings,
    setTaxSettings,
  } = useScenario();

  // Form state
  const [name, setName] = useState("");
  const [cost, setCost] = useState<number | "">("");
  const [method, setMethod] = useState<ReplacementMethod>("AUTO");
  const [businessUse, setBusinessUse] = useState<number | "">(100);

  const MONTHS = [
    { label: "Jan", value: "01" },
    { label: "Feb", value: "02" },
    { label: "Mar", value: "03" },
    { label: "Apr", value: "04" },
    { label: "May", value: "05" },
    { label: "Jun", value: "06" },
    { label: "Jul", value: "07" },
    { label: "Aug", value: "08" },
    { label: "Sep", value: "09" },
    { label: "Oct", value: "10" },
    { label: "Nov", value: "11" },
    { label: "Dec", value: "12" },
  ];

  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState("01");
  const [year, setYear] = useState(currentYear.toString());
  const [error, setError] = useState("");
  const [showLowBusinessUseError, setShowLowBusinessUseError] = useState(false);

  const handleAdd = () => {
    setError("");
    setShowLowBusinessUseError(false);

    // Validation
    if (!name.trim()) return setError("Asset Name is required.");

    if (cost === "" || Number(cost) <= 0)
      return setError("Cost is required.");

    if (!month) return setError("Please select an in-service month.");

    if (!year || year.length !== 4)
      return setError("Year must be a 4-digit number.");

    if (
      businessUse === "" ||
      Number(businessUse) < 0 ||
      Number(businessUse) > 100
    ) {
      return setError("Business Use must be between 0 and 100.");
    }

    // Marginal Rate is the only required tax field now
    if (taxSettings.marginalRate === "")
      return setError("Marginal Tax Rate is required.");

    // ID Generator
    const id =
      typeof window !== "undefined" &&
        window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    // Check Section 179 Limit Blocking
    if (method === "SECTION_179") {
      const limit = taxSettings.section179Limit === "" ? 2560000 : taxSettings.section179Limit;
      const usedSoFar = replacementAssets.reduce((acc, curr) => {
        if (curr.method === "SECTION_179" || curr.method === "AUTO") {
          return acc + (curr.cost * (curr.businessUse / 100));
        }
        return acc;
      }, 0);

      if (usedSoFar >= limit) {
        return setError(`Section 179 limit ($${formatWithCommas(limit)}) exceeded. Please choose Auto-Max or another method.`);
      }
    }

    // Check Business Use for Accelerated Methods
    if (Number(businessUse) && Number(businessUse) <= 50) {
      if (method !== "AUTO" && method !== "MACRS_ADS") {
        setShowLowBusinessUseError(true);
        return;
      }
    }

    addReplacementAsset({
      id,
      name,
      cost: Number(cost),
      method,
      businessUse: Number(businessUse),
      inServiceMonth: `${year}-${month}`,
    });

    // Reset form
    setName("");
    setCost("");
    setMethod("AUTO");
    setBusinessUse(100);
    setMonth("01");
    setYear(currentYear.toString());
  };

  return (
    <section id="replacement-purchases" className="min-h-screen max-w-4xl">
      <h2 className="scenario-heading mb-6">Add Replacement Purchases</h2>



      {/* ---------------- TAX SETTINGS FIRST ---------------- */}
      <div className="bg-white border rounded-lg p-5 mb-10 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Tax Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Marginal Tax Rate */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Marginal Tax Rate <span className="text-red-500">*</span></label>
            <select
              value={
                taxSettings.marginalRate === ""
                  ? ""
                  : (taxSettings.marginalRate * 100).toString()
              }
              onChange={(e) => {
                const v = e.target.value;
                setTaxSettings({
                  marginalRate: v === "" ? "" : Number(v) / 100,
                });
              }}
              className="w-full border p-2 rounded"
            >
              <option value="">Select rate</option>
              {[10, 12, 22, 24, 32, 35, 37].map((r) => (
                <option key={r} value={r}>
                  {r}%
                </option>
              ))}
            </select>
          </div>

          {/* Section 179 Limit */}
          <div>
            <label className="text-sm text-gray-600">§179 Limit Remaining (Optional)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatWithCommas(taxSettings.section179Limit)}
              onChange={(e) => {
                const cleaned = onlyDigits(e.target.value);
                if (cleaned.length > 7) return; // Cap at 7 digits (< 10M)
                setTaxSettings({
                  section179Limit: cleaned === "" ? "" : Number(cleaned),
                });
              }}
              className="w-full border p-2 rounded"
              placeholder="$2,560,000"
            />
          </div>

          {/* Bonus Percent */}
          <div>
            <label className="text-sm text-gray-600">Bonus % (Optional)</label>
            <input
              type="text"
              inputMode="numeric"
              value={taxSettings.bonusPercent === "" ? "" : taxSettings.bonusPercent}
              onChange={(e) => {
                const cleaned = onlyDigits(e.target.value);
                const val = cleaned === "" ? "" : Math.min(100, Number(cleaned));
                setTaxSettings({
                  bonusPercent: val,
                });
              }}
              className="w-full border p-2 rounded"
              placeholder="100"
            />
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded">
          <p>
            2026 Defaults (if left blank): <strong>Full §179 Limit</strong> ($2.56M & Phase-Out Threshold = $4.09M) and <strong>Statutory Bonus %</strong> (100).
          </p>
        </div>
      </div>

      {/* Error Box */}
      {error && (
        <div className="max-w-lg mx-auto mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow">
          {error}
        </div>
      )}

      {/* ---------------- ADD REPLACEMENT FORM ---------------- */}
      <div className="bg-white border rounded-lg p-5 mb-10 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Add a Replacement Asset</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Asset Name */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-sm text-gray-600">Asset Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="e.g. New Equipment"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="text-sm text-gray-600">Cost</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatWithCommas(cost)}
              onChange={(e) => {
                const cleaned = onlyDigits(e.target.value);
                if (Number(cleaned) > 999999999) return;
                setCost(cleaned === "" ? "" : Number(cleaned));
              }}
              className="w-full border p-2 rounded"
              placeholder="$0"
            />
          </div>

          {/* Method */}
          <div>
            <label className="text-sm text-gray-600">Depreciation Method</label>
            <select
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as ReplacementMethod)
              }
              className="w-full border p-2 rounded"
            >
              <option value="AUTO">✨ Auto-Maximize Tax Savings</option>
              <option value="BONUS">Bonus Depreciation</option>
              <option value="SECTION_179">§179 Expensing</option>
              <option value="MACRS_GDS">MACRS GDS (Accelerated)</option>
              <option value="MACRS_ADS">MACRS ADS (Straight-Line)</option>
            </select>
            <MethodHelp method={method} />
          </div>

          {/* Business Use */}
          <div>
            <label className="text-sm text-gray-600">Business Use %</label>
            <input
              type="text"
              inputMode="numeric"
              value={businessUse === "" ? "" : businessUse}
              onChange={(e) => {
                const cleaned = onlyDigits(e.target.value).slice(0, 3);
                const num = cleaned === "" ? "" : Math.min(100, Number(cleaned));
                setBusinessUse(num);
              }}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* In-service date */}
          <div>
            <label className="text-sm text-gray-600">In-service Month</label>
            <div className="flex gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="border p-2 rounded w-1/2"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                inputMode="numeric"
                value={year}
                onChange={(e) =>
                  setYear(onlyDigits(e.target.value).slice(0, 4))
                }
                className="border p-2 rounded w-1/2"
              />
            </div>
          </div>

          {/* Add Button */}
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full bg-dpa-dark-green text-white px-4 py-2 rounded shadow hover:bg-green-800 transition font-semibold"
            >
              Add Replacement
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- LIST ---------------- */}
      <div className="space-y-3 max-w-4xl">

        {/* Global Warning for Auto-Max */}
        {replacementAssets.some((r) => r.method === "AUTO") && (
          <div className="mb-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 flex items-center">
            <span className="mr-2 text-lg">⚠️</span>
            <span>
              <strong>Note:</strong> Stacking methods requires {'>'}50% business use and may be restricted by annual spending caps or asset-specific IRS limits.
            </span>
          </div>
        )}

        {/* Warning: Business Use <= 50% - Only show on failed submit attempt */}
        {showLowBusinessUseError && Number(businessUse) >= 0 && Number(businessUse) <= 50 && (
          <div className="mb-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center">
            <span className="mr-2 text-lg">🛑</span>
            <span>
              <strong>Low Business Use:</strong> You are not eligible for Section 179, Bonus Depreciation, or Accelerated MACRS with {'<'}50% business use.
            </span>
          </div>
        )}



        {/* Helper to calculate estimated usage */}
        {(() => {
          const limit = taxSettings.section179Limit === "" ? 2560000 : taxSettings.section179Limit;
          const usedSoFar = replacementAssets.reduce((acc, curr) => {
            if (curr.method === "SECTION_179" || curr.method === "AUTO") {
              return acc + (curr.cost * (curr.businessUse / 100));
            }
            return acc;
          }, 0);

          const remaining = Math.max(0, limit - usedSoFar);

          // If user selects 179 and has no limit left
          if (method === "SECTION_179" && remaining <= 0 && usedSoFar > 0) {
            return (
              <div className="mb-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center">
                <span className="mr-2 text-lg">🚫</span>
                <span>
                  <strong>Section 179 Limit Exceeded:</strong> You have likely exhausted your ${formatWithCommas(limit)} limit with existing assets. Please select "Auto-Max" or another method.
                </span>
              </div>
            );
          }
          return null;
        })()}

        {replacementAssets.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No replacement purchases added yet.
          </p>
        ) : (
          replacementAssets.map((r) => {
            const displayMethod =
              r.method === "AUTO" ? "✨ Auto-Max" : r.method.replace("_", " ");

            return (
              <div
                key={r.id}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap items-center gap-3 text-lg">
                    <span className="font-bold text-gray-900">{r.name}</span>
                    <span className="text-gray-300">|</span>

                    <span className="font-semibold text-gray-700">
                      ${r.cost.toLocaleString()}
                    </span>
                    <span className="text-gray-300">|</span>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${r.method === "AUTO"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {displayMethod}
                    </span>
                    <span className="text-gray-300">|</span>

                    <span className="text-base text-gray-500 font-medium">
                      {r.inServiceMonth}
                    </span>
                  </div>

                  <button
                    onClick={() => removeReplacementAsset(r.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded transition opacity-0 group-hover:opacity-100"
                    title="Remove Asset"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default AddReplacement;
