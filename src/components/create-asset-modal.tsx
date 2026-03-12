// create-asset-modal.tsx (Refactored & fixed with input formatting)

"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  initialData?: any;
}

// --- MACRS default useful life values ---
const MACRS_LIFETIMES: Record<string, number> = {
  Equipment: 10,
  Vehicle: 5,
  Tractor: 10,
  Combine: 10,
};

// Helper: only allow digits
const onlyDigits = (str: string) => str.replace(/\D/g, "");

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

const CreateAssetModal = ({ onSuccess, onClose, initialData }: Props) => {
  const { user } = useAuth();
  const isEditMode = !!initialData;

  // Initialize state with initialData if available
  // Initialize state (No pre-fill, as requested)
  const [type, setType] = useState<string>("Equipment");
  const [manufacturer, setManufacturer] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [modelYear, setModelYear] = useState<string>("");

  const [purchasePrice, setPurchasePrice] = useState<string>("");

  const [bookValue, setBookValue] = useState<string>("");

  const [usefulLife, setUsefulLife] = useState<string>("7");

  const [purchaseMonth, setPurchaseMonth] = useState<string>("");
  const [purchaseYear, setPurchaseYear] = useState<string>("");

  const [usage, setUsage] = useState<string>("");
  const [usageUnit, setUsageUnit] = useState<string>("hours");

  const [condition, setCondition] = useState<string>("");
  const [country, setCountry] = useState<string>("United States");
  const [zipCode, setZipCode] = useState<string>("");

  // Prevent auto-calc from overwriting initial BookValue on first render
  const isInitialMount = React.useRef(true);

  // Auto-calculated financials
  const salvageValue = 0; // Always 0
  const depreciationMethod = "MACRS";
  // const usefulLife = MACRS_LIFETIMES[type] || 7; // NOW USER INPUT

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Format number with commas
  const formatNumberWithCommas = (num: string) => {
    const cleaned = num.replace(/[^0-9.]/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Update default useful life when type changes (only if not editing or explicit user change)
  React.useEffect(() => {
    if (!isEditMode) {
      const defaultLife = MACRS_LIFETIMES[type] || 10;
      setUsefulLife(defaultLife.toString());
    }
  }, [type, isEditMode]);

  // Auto-Calculate Book Value on relevant changes
  React.useEffect(() => {
    // Skip calculation on initial mount if editing (preserve existing Book Value)
    if (isEditMode && isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // If we're missing crucial info, don't overwrite with 0 or NaN, unless it's a clear reset
    if (!purchasePrice || !purchaseMonth || !purchaseYear) return;

    // usefulLife might be string, convert safely
    const lifeYears = Number(usefulLife);
    const cost = Number(purchasePrice.replace(/,/g, ""));

    if (lifeYears <= 0 || isNaN(cost) || isNaN(lifeYears)) return;

    // Simple Straight-Line Logic
    // Book Value = Cost - Depreciation
    // Dep = (Cost / Life) * (MonthsInService / 12)

    const now = new Date();
    // purchaseMonth is "01", "02", etc.
    const pYear = Number(purchaseYear);
    const pMonth = Number(purchaseMonth);

    // Validate date
    if (isNaN(pYear) || isNaN(pMonth)) return;

    const purchaseDate = new Date(pYear, pMonth - 1, 1);

    // Calculate months difference
    // (YearDiff * 12) + (MonthDiff)
    // If purchase date is Dec 2023 and now is Jan 2024: (1 * 12) + (0 - 11) = 12 - 11 = 1 month? No.
    // 2024 - 2023 = 1. Jan(0) - Dec(11) = -11. 12 + (-11) = 1. Correct.
    const monthsInService =
      (now.getFullYear() - purchaseDate.getFullYear()) * 12 +
      (now.getMonth() - purchaseDate.getMonth());

    if (monthsInService < 0) {
      // Future date? Just use cost.
      setBookValue(formatNumberWithCommas(cost.toFixed(0)));
      return;
    }

    const annualDepreciation = cost / lifeYears;
    const monthlyDepreciation = annualDepreciation / 12;
    const totalDepreciation = monthlyDepreciation * monthsInService;

    const currentBookValue = Math.max(0, cost - totalDepreciation);

    setBookValue(formatNumberWithCommas(currentBookValue.toFixed(0)));

  }, [purchasePrice, purchaseMonth, purchaseYear, usefulLife]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to create an asset.");
      return;
    }

    if (
      !manufacturer ||
      !model ||
      !modelYear ||
      !purchasePrice ||
      !bookValue ||
      !usefulLife ||
      !purchaseMonth ||
      !purchaseYear ||
      !condition ||
      !country ||
      !zipCode
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const api = process.env.NEXT_PUBLIC_API_URL;

      const purchaseDate = `${purchaseYear}-${purchaseMonth}-01`; // default day = 1

      const assetData = {
        AssetId: isEditMode ? initialData.AssetId : 0,
        UserId: user.user_id,
        Type: type,
        Manufacturer: manufacturer,
        Model: model,
        ModelYear: modelYear,
        PurchasePrice: Number(purchasePrice.replace(/,/g, "")), // remove commas
        PurchaseDate: purchaseDate,
        BookValue: Number(bookValue.replace(/,/g, "")),
        SalvageValue: salvageValue,
        Usage: Number(usage.replace(/,/g, "")) || 0, // remove commas
        Condition: condition,
        Country: country,
        ZipCode: zipCode,
        State: "", // Hardcoded empty as removed from UI
        DepreciationMethod: depreciationMethod,
        UsefulLife: Number(usefulLife),
        fairMarketValuesOverTime: [],
        assetDepreciationSchedule: [],
      };

      // Determine endpoint based on mode
      const endpoint = isEditMode ? "UpdateAsset" : "CreateAsset";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(`${api}/${endpoint}`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetData),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Failed to ${isEditMode ? "update" : "create"} asset`);
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
          <h3 className="text-2xl font-semibold">{isEditMode ? "Edit Asset" : "Create New Asset"}</h3>
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

        <form onSubmit={handleSubmit} autoComplete="off">
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
                  maxLength={50}
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
                  maxLength={50}
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
                <label className="block text-sm font-medium mb-1">Usage</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={usage}
                    onChange={(e) => {
                      const cleaned = onlyDigits(e.target.value);
                      if (Number(cleaned) > 999999999) return;
                      setUsage(formatNumberWithCommas(e.target.value));
                    }}
                    className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                  <select
                    value={usageUnit}
                    onChange={(e) => setUsageUnit(e.target.value)}
                    className="border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500 w-28"
                  >
                    <option value="hours">hrs</option>
                    <option value="miles">mi</option>
                    <option value="kilometers">km</option>
                  </select>
                </div>
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
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    if (Number(cleaned) > 999999999) return;
                    setPurchasePrice(formatNumberWithCommas(e.target.value));
                  }}
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

          {/* Tax Basis */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3 text-gray-700">Financials</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Useful Life (Years) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={usefulLife}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    setUsefulLife(cleaned);
                  }}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Tax Basis (Book Value) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bookValue}
                  onChange={(e) =>
                    setBookValue(formatNumberWithCommas(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <span>✨</span> Auto-calculated with straight-line depreciation (editable).
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3 text-gray-700">Location</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Zip Code *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-green-500"
                  placeholder="12345"
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
              {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Asset" : "Create Asset")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssetModal;