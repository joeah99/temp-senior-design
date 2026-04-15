"use client";

import { Trash2, LineChart } from "lucide-react";

import React, { useState, useEffect } from "react";
import { useScenario, ReplacementAsset } from "@/context/ScenarioContext";
import { useAuth } from "@/context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import AiUploadModal from "./upload/ai-upload-modal";

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
    setReplacementAssets,
  } = useScenario();

  const { user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Tax policy defaults (loaded from API)
  const [policyDefaults, setPolicyDefaults] = useState<{
    section179Limit: number;
    section179PhaseoutThreshold: number;
    bonusPercent: number;
    policySource: string;
  }>({
    section179Limit: 2560000,
    section179PhaseoutThreshold: 4090000,
    bonusPercent: 100,
    policySource: "Fallback"
  });

  // Fetch tax policy defaults for current year
  useEffect(() => {
    const fetchTaxPolicy = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const res = await fetch(`${API_URL}/scenarios/tax-policy/${currentYear}`);
        if (res.ok) {
          const data = await res.json();
          setPolicyDefaults({
            section179Limit: data.section179Limit ?? data.section_179_limit ?? 2560000,
            section179PhaseoutThreshold: data.section179PhaseoutThreshold ?? data.section_179_phaseout_threshold ?? 4090000,
            bonusPercent: data.bonusDepreciationPercent ?? data.bonus_depreciation_percent ?? 100,
            policySource: data.policySource ?? data.policy_source ?? "Fallback"
          });
        }
      } catch (err) {
        console.warn("Could not fetch tax policy defaults — using fallback values.", err);
      }
    };
    fetchTaxPolicy();
  }, [API_URL]);

  // Fetch existing purchases on mount
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user?.user_id) return;
      try {
        const res = await fetch(`${API_URL}/purchases?user_id=${user.user_id}`);
        if (res.ok) {
          const data = await res.json();
          const mapped: ReplacementAsset[] = data.map((p: any) => ({
            id: p.purchase_id,
            name: p.asset_name,
            cost: p.cost,
            method: p.depreciation_method,
            businessUse: p.business_use_percent,
            inServiceMonth: p.in_service_month,
            assetType: p.asset_type,
            manufacturer: p.manufacturer,
            model: p.model,
            modelYear: p.model_year,
            serialNumber: p.serial_number,
            usage: p.usage,
            usageUnit: p.usage_unit,
            purchaseType: p.purchase_type
          }));
          setReplacementAssets(mapped);
        }
      } catch (err) {
        console.error("Error fetching purchases:", err);
      }
    };

    fetchPurchases();
  }, [user?.user_id, setReplacementAssets, API_URL]);

  // Form state
  const [assetType, setAssetType] = useState("Equipment");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [modelYear, setModelYear] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  // Condition removed
  const [usage, setUsage] = useState<number | "">("");
  const [usageUnit, setUsageUnit] = useState("hours");

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showLowBusinessUseError, setShowLowBusinessUseError] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<{ id: string | number; name: string } | null>(null);

  // Depreciation Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulePurchase, setSchedulePurchase] = useState<{ id: string | number; name: string } | null>(null);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const formatCurrencyForm = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleShowSchedule = async (id: string | number, name: string) => {
    setSchedulePurchase({ id, name });
    setIsScheduleModalOpen(true);
    setLoadingSchedule(true);

    try {
      const res = await fetch(`${API_URL}/purchases/${id}/depreciation-schedule`);
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
      } else {
        console.error("Failed to fetch schedule");
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const confirmDelete = async () => {
    if (!purchaseToDelete) return;

    try {
      const res = await fetch(`${API_URL}/purchases/${purchaseToDelete.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        setError("Failed to delete from database");
      } else {
        removeReplacementAsset(purchaseToDelete.id);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete from database");
    } finally {
      setIsDeleteModalOpen(false);
      setPurchaseToDelete(null);
    }
  };

  const handleAdd = () => {
    setError("");
    setShowLowBusinessUseError(false);

    // Validation
    if (!assetType) return setError("Asset Type is required.");
    // Condition validation removed
    if (!manufacturer.trim()) return setError("Manufacturer is required.");
    if (!model.trim()) return setError("Model is required.");
    if (!modelYear || modelYear.length !== 4) return setError("Model Year must be 4 digits.");

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
      const limit = taxSettings.section179Limit === "" ? policyDefaults.section179Limit : taxSettings.section179Limit;
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

    const name = `${modelYear} ${manufacturer} ${model}`;

    const savePurchase = async () => {
      if (!user?.user_id) return;

      const payload = {
        user_id: user.user_id,
        asset_name: name,
        asset_type: assetType,
        manufacturer: manufacturer,
        model: model,
        model_year: modelYear,
        serial_number: serialNumber === "" ? null : serialNumber,
        usage: usage === "" ? null : Number(usage),
        usage_unit: usageUnit,
        cost: Number(cost),
        depreciation_method: method,
        business_use_percent: Number(businessUse),
        in_service_month: `${year}-${month}`,
        purchase_type: "REPLACEMENT"
      };

      try {
        const fullUrl = `${API_URL}/purchases`;
        console.log("=== PURCHASE DEBUG ===");
        console.log("API_URL:", API_URL);
        console.log("Full URL:", fullUrl);
        console.log("Payload:", payload);

        const res = await fetch(fullUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        console.log("Response status:", res.status);
        console.log("Response OK:", res.ok);

        if (!res.ok) {
          const responseText = await res.text();
          console.error("Error response:", responseText);
          throw new Error(responseText || "Failed to save purchase");
        }

        const saved = await res.json();
        console.log("Saved purchase:", saved);

        addReplacementAsset({
          id: saved.purchase_id,
          name,
          cost: Number(cost),
          method,
          businessUse: Number(businessUse),
          inServiceMonth: `${year}-${month}`,
          assetType,
          manufacturer,
          model,
          modelYear,
          serialNumber: serialNumber === "" ? undefined : serialNumber,
          usage: usage === "" ? undefined : Number(usage),
          usageUnit,
        });

        // Reset form
        setManufacturer("");
        setModel("");
        setModelYear("");
        setSerialNumber("");
        setUsage("");
        setCost("");
        setMethod("AUTO");
        setBusinessUse(100);
        setMonth("01");
        setYear(currentYear.toString());

      } catch (err: any) {
        setError(err.message || "Failed to save purchase to database");
      }
    };

    savePurchase();
  };

  return (
    <section id="replacement-purchases" className="min-h-screen max-w-4xl">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="scenario-heading">Add Replacement Purchases</h2>
        <button
          onClick={() => setShowAiModal(true)}
          className="bg-green-50 text-dpa-dark-green font-semibold p-2 px-4 rounded-full hover:bg-green-100 flex items-center gap-2 border border-green-200"
        >
          <span>✨</span> Extract via AI
        </button>
      </div>

      <AiUploadModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSave={(data) => {
          if (data.asset_type) setAssetType(data.asset_type);
          if (data.manufacturer) setManufacturer(data.manufacturer);
          if (data.model) setModel(data.model);
          if (data.model_year) setModelYear(data.model_year.toString());
          if (data.serial_number) setSerialNumber(data.serial_number);
          if (data.usage != null) setUsage(Math.round(data.usage));
          if (data.purchase_price != null) setCost(Math.round(data.purchase_price));
          if (data.purchase_month) setMonth(data.purchase_month.padStart(2, '0'));
          if (data.purchase_year) setYear(data.purchase_year.toString());
        }}
      />



      {/* ---------------- TAX SETTINGS FIRST ---------------- */}
      <div className="bg-white border rounded-lg p-5 mb-10 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Tax Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Marginal Tax Rate */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Federal Tax Rate <span className="text-red-500">*</span></label>
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

          {/* State Tax Rate */}
          <div>
            <label className="text-sm text-gray-600 font-medium">State Tax Rate (Optional)</label>
            <div className="relative">
              <input
                type="text"
                value={taxSettings.stateTaxRate === "" || taxSettings.stateTaxRate == null ? "" : Math.round(taxSettings.stateTaxRate * 100).toString()}
                onChange={(e) => {
                  const cleaned = onlyDigits(e.target.value).slice(0, 2);
                  const val = cleaned === "" ? "" : Number(cleaned) / 100;
                  setTaxSettings({
                    stateTaxRate: val,
                  });
                }}
                className="w-full border p-2 rounded pr-6"
                autoComplete="off"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
            </div>
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
              autoComplete="off"
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
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded">
          <p>
            {new Date().getFullYear()} Defaults (if left blank): <strong>Full §179 Limit</strong> (${(policyDefaults.section179Limit / 1_000_000).toFixed(2)}M &amp; Phase-Out Threshold = ${(policyDefaults.section179PhaseoutThreshold / 1_000_000).toFixed(2)}M) and <strong>Statutory Bonus %</strong> ({policyDefaults.bonusPercent}).
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Asset Type */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Asset Type</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="Equipment">Equipment</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Tractor">Tractor</option>
              <option value="Combine">Combine</option>
            </select>
          </div>

          {/* Manufacturer */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Manufacturer</label>
            <input
              value={manufacturer}
              maxLength={50}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full border p-2 rounded"
              autoComplete="off"
            />
          </div>

          {/* Model */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Model</label>
            <input
              value={model}
              maxLength={50}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border p-2 rounded"
              autoComplete="off"
            />
          </div>

          {/* Model Year */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Model Year</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={modelYear}
              onChange={(e) => setModelYear(onlyDigits(e.target.value).slice(0, 4))}
              className="w-full border p-2 rounded"
              autoComplete="off"
            />
          </div>

          {/* Serial Number */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Serial Number (Optional)</label>
            <input
              type="text"
              maxLength={30}
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full border p-2 rounded uppercase"
              autoComplete="off"
            />
          </div>

          {/* Usage */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Usage (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={formatWithCommas(usage)}
                onChange={(e) => {
                  const cleaned = onlyDigits(e.target.value);
                  if (Number(cleaned) > 999999999) return;
                  setUsage(cleaned === "" ? "" : Number(cleaned));
                }}
                className="w-full border p-2 rounded"
                autoComplete="off"
              />
              <select
                value={usageUnit}
                onChange={(e) => setUsageUnit(e.target.value)}
                className="border p-2 rounded w-28"
              >
                <option value="hours">hrs</option>
                <option value="miles">mi</option>
                <option value="kilometers">km</option>
              </select>
            </div>
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
              autoComplete="off"
            />
          </div>

          {/* Business Use */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Business Use %</label>
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
              autoComplete="off"
            />
          </div>

          {/* In-service date */}
          <div>
            <label className="text-sm text-gray-600 font-medium">In-service Month</label>
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
                autoComplete="off"
              />
            </div>
          </div>

          {/* Method */}
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 font-medium">Depreciation Method</label>
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



          {/* Add Button */}
          <div className="flex items-start mt-6 w-full">
            <button
              onClick={handleAdd}
              className="w-full bg-dpa-dark-green text-white px-4 py-2 rounded shadow hover:bg-green-800 transition font-semibold h-[42px]"
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
          const limit = taxSettings.section179Limit === "" ? policyDefaults.section179Limit : taxSettings.section179Limit;
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
                      ${formatWithCommas(r.cost)}
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

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleShowSchedule(r.id, r.name);
                      }}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md flex items-center gap-2 font-medium shadow-sm transition"
                    >
                      <LineChart className="w-4 h-4" />
                      <span className="text-sm">Show Depreciation Schedule</span>
                    </button>

                    <button
                      onClick={() => {
                        setPurchaseToDelete({ id: r.id, name: r.name });
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-red-600 p-1 rounded transition opacity-0 group-hover:opacity-100"
                      title="Remove Asset"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && purchaseToDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 border border-red-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Purchase?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-semibold text-gray-800">{purchaseToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPurchaseToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Depreciation Schedule Modal */}
      {isScheduleModalOpen && schedulePurchase && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full flex flex-col pointer-events-auto" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Depreciation Schedule: {schedulePurchase.name}</h3>
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setScheduleData([]);
                  setSchedulePurchase(null);
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {loadingSchedule ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-lg text-gray-500 animate-pulse">Loading schedule data...</div>
                </div>
              ) : scheduleData.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-gray-500 text-center">
                    <p>No depreciation schedule available.</p>
                    <p className="text-sm mt-2">Make sure you have saved this asset under your purchases.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Chart Container */}
                  <div className="h-80 w-full mb-6 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={scheduleData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: '#6B7280' }}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          tick={{ fill: '#6B7280' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          formatter={(value: any) => formatCurrencyForm(value)}
                          labelFormatter={(label: any) => `Year ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                          dataKey="depreciation"
                          name="Depreciation Expense"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Data Table */}
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Year</th>
                          <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Depreciation Expense</th>
                          <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Remaining Basis</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scheduleData.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-3 font-medium text-gray-900">{row.year}</td>
                            <td className="px-6 py-3 text-right text-gray-700">{formatCurrencyForm(row.depreciation)}</td>
                            <td className="px-6 py-3 text-right text-gray-700">{formatCurrencyForm(row.remaining_basis)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </section>
  );
};


export default AddReplacement;
