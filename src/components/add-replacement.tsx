"use client";

import React, { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";

const onlyDigits = (str: string) => str.replace(/\D/g, "");
const formatWithCommas = (num: number | "") =>
  num === "" ? "" : num.toLocaleString();

type ReplacementMethod = "BONUS" | "SECTION_179" | "MACRS_GDS" | "MACRS_ADS";

const MethodHelp = ({ method }: { method: ReplacementMethod }) => {
  const helpText =
    method === "BONUS"
      ? "Bonus: immediate full expensing (100% by default) of business-use portion."
      : method === "SECTION_179"
      ? "§179: immediate deduction up to the §179 limit."
      : method === "MACRS_GDS"
      ? "MACRS GDS: accelerated depreciation (simplified 5-year, first-year ~20%)."
      : "MACRS ADS: straight-line (simplified 5-year in this model).";

  return <p className="text-xs text-gray-500 mt-1">{helpText}</p>;
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
  const [method, setMethod] = useState<ReplacementMethod>("BONUS");
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

  const [month, setMonth] = useState("01");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [error, setError] = useState("");

  const handleAdd = () => {
    setError("");

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

    // Required tax fields
    if (taxSettings.marginalRate === "")
      return setError("Marginal Rate is required.");
    if (taxSettings.section179Limit === "")
      return setError("Section 179 Limit is required.");
    if (taxSettings.bonusPercent === "")
      return setError("Bonus % is required.");

    // ID Generator
    const id =
      typeof window !== "undefined" &&
      window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

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
    setMethod("BONUS");
    setBusinessUse(100);
    setMonth("01");
    setYear(new Date().getFullYear().toString());
  };

  return (
    <section id="replacement-purchases" className="min-h-screen max-w-4xl">
      <h2 className="scenario-heading mb-6">Add Replacement Purchases</h2>

      {/* Error Box */}
      {error && (
        <div className="max-w-lg mx-auto mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow">
          {error}
        </div>
      )}

      {/* ---------------- TAX SETTINGS FIRST ---------------- */}
      <div className="bg-white border rounded-lg p-5 mb-10 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Required Tax Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Marginal Rate */}
          <div>
            <label className="text-sm text-gray-600">Marginal Rate</label>
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

          {/* Section 179 */}
          <div>
            <label className="text-sm text-gray-600">§179 Limit</label>
            <input
              type="text"
              inputMode="numeric"
              value={
                taxSettings.section179Limit === ""
                  ? ""
                  : formatWithCommas(taxSettings.section179Limit)
              }
              onChange={(e) => {
                const cleaned = onlyDigits(e.target.value);
                setTaxSettings({
                  section179Limit: cleaned === "" ? "" : Number(cleaned),
                });
              }}
              className="w-full border p-2 rounded"
              placeholder="e.g. 1220000"
            />
          </div>

          {/* Bonus % */}
          <div>
            <label className="text-sm text-gray-600">Bonus %</label>
            <input
              type="text"
              inputMode="numeric"
              value={
                taxSettings.bonusPercent === ""
                  ? ""
                  : taxSettings.bonusPercent.toString()
              }
              onChange={(e) => {
                const cleaned = onlyDigits(e.target.value).slice(0, 3);
                const num = cleaned === "" ? "" : Math.min(100, Number(cleaned));
                setTaxSettings({ bonusPercent: num });
              }}
              placeholder="e.g. 100"
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
      </div>

      {/* ---------------- ADD REPLACEMENT FORM ---------------- */}
      <div className="bg-white border rounded-lg p-5 mb-10 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Add a Replacement Asset</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Asset Name */}
          <div>
            <label className="text-sm text-gray-600">Asset Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
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
                setCost(cleaned === "" ? "" : Number(cleaned));
              }}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Method */}
          <div>
            <label className="text-sm text-gray-600">Method</label>
            <select
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as ReplacementMethod)
              }
              className="w-full border p-2 rounded"
            >
              <option value="BONUS">Bonus 100%</option>
              <option value="SECTION_179">§179</option>
              <option value="MACRS_GDS">MACRS GDS</option>
              <option value="MACRS_ADS">MACRS ADS</option>
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
              className="w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            >
              Add Replacement
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- LIST ---------------- */}
      <div className="space-y-3 max-w-3xl">
        {replacementAssets.length === 0 ? (
          <p className="text-gray-600">No replacement purchases added yet.</p>
        ) : (
          replacementAssets.map((r) => (
            <div
              key={r.id}
              className="bg-white border rounded p-4 flex justify-between items-center shadow-sm"
            >
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="text-sm text-gray-600">
                  ${r.cost.toLocaleString()} • {r.method} • {r.businessUse}% •{" "}
                  {r.inServiceMonth}
                </div>
              </div>

              <button
                onClick={() => removeReplacementAsset(r.id)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default AddReplacement;
