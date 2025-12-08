// create-asset-modal.tsx (Refactored & fixed with input formatting)

"use client";

import React, { useState } from "react";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

// --- MACRS default useful life values ---
const MACRS_LIFETIMES: Record<string, number> = {
  Equipment: 7,
  Vehicle: 5,
  Tractor: 5,
  Combine: 5,
};

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

const CreateAssetModal = ({ onSuccess, onClose }: Props) => {
  // Required visible fields
  const [type, setType] = useState<string>("Equipment");
  const [manufacturer, setManufacturer] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [modelYear, setModelYear] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<string>(""); // store as string for formatting
  const [purchaseMonth, setPurchaseMonth] = useState<string>(""); // MM
  const [purchaseYear, setPurchaseYear] = useState<string>(""); // YYYY
  const [usage, setUsage] = useState<string>(""); // string for formatting commas
  const [condition, setCondition] = useState<string>(""); // empty by default
  const [country, setCountry] = useState<string>(""); // empty by default
  const [state, setState] = useState<string>(""); // empty by default

  // Auto-calculated financials
  const salvageValue = 0; // Always 0
  const depreciationMethod = "MACRS";
  const usefulLife = MACRS_LIFETIMES[type] || 7;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Format number with commas
  const formatNumberWithCommas = (num: string) => {
    const cleaned = num.replace(/[^0-9]/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !manufacturer ||
      !model ||
      !modelYear ||
      !purchasePrice ||
      !purchaseMonth ||
      !purchaseYear ||
      !condition ||
      !country ||
      !state
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const api = process.env.NEXT_PUBLIC_API_URL;

      const purchaseDate = `${purchaseYear}-${purchaseMonth}-01`; // default day = 1

      const assetData = {
        AssetId: 0,
        UserId: 1, // TODO: hook into auth
        Type: type,
        Manufacturer: manufacturer,
        Model: model,
        ModelYear: modelYear,
        PurchasePrice: Number(purchasePrice.replace(/,/g, "")), // remove commas
        PurchaseDate: purchaseDate,
        BookValue: Number(purchasePrice.replace(/,/g, "")),
        SalvageValue: salvageValue,
        Usage: Number(usage.replace(/,/g, "")) || 0, // remove commas
        Condition: condition,
        Country: country,
        State: state,
        DepreciationMethod: depreciationMethod,
        UsefulLife: usefulLife,
        DepreciationRate: 0,
        TotalExpectedUnitsOfProduction: 0,
        UnitsProducedInYear: 0,
        Deleted: false,
        fairMarketValuesOverTime: [],
        assetDepreciationSchedule: [],
      };

      const res = await fetch(`${api}/CreateAsset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetData),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to create asset");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Create New Asset</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3 text-gray-700">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                >
                  {Object.keys(MACRS_LIFETIMES).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select condition</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Manufacturer *</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model *</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model Year *</label>
                <input
                  type="text"
                  maxLength={4}
                  inputMode="numeric"
                  value={modelYear}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                    setModelYear(cleaned);
                  }}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Usage (hours/miles)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={usage}
                  onChange={(e) => setUsage(formatNumberWithCommas(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Purchase Info */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3 text-gray-700">
              Purchase Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Price ($) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(formatNumberWithCommas(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Purchase Month & Year *</label>
                <div className="flex gap-2">
                  <select
                    value={purchaseMonth}
                    onChange={(e) => setPurchaseMonth(e.target.value)}
                    className="border rounded-md p-2 w-24"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="YYYY"
                    value={purchaseYear}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                      setPurchaseYear(cleaned);
                    }}
                    className="border rounded-md p-2 w-24"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auto depreciation summary */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-1 text-gray-700">Depreciation (Auto-Calculated)</h4>
            <p className="text-sm text-gray-600 mb-2">
              Using MACRS {usefulLife}-year schedule. Salvage value automatically set to $0.
            </p>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3 text-gray-700">Location</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State / Province *</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-dpa-dark-green text-white rounded hover:bg-green-800 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssetModal;
