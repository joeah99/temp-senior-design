"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AssetTypeCard } from "@/components/assets-card";

// ---- TYPES ----
export interface ScenarioAssetSaleDetails {
  salePrice?: number; // optional to allow empty inputs
  fees?: number;
  closeMonth?: string;
}

export interface ReplacementAsset {
  id: string; // uuid
  name: string;
  cost: number;
  method: "BONUS" | "SECTION_179" | "MACRS_GDS" | "MACRS_ADS";
  businessUse: number; // percentage 0–100
  inServiceMonth: string;
}

export interface TaxResultSummary {
  totalAssetValue: number;
  bonusDepreciation: number;
  section179: number;
  macrsDepreciation: number;
  taxSavings: number;
  netCashFlow: number;
}

export interface TaxSettings {
  marginalRate: number; // decimal: e.g., 0.37
  section179Limit: number; // e.g., 1220000
  bonusPercent: number; // e.g., 100
}

// ---- CONTEXT ----
interface ScenarioContextType {
  selectedAssets: AssetTypeCard[];
  saleDetails: Record<number, ScenarioAssetSaleDetails>;
  replacementAssets: ReplacementAsset[];
  computedResults: TaxResultSummary | null;
  taxSettings: TaxSettings;

  addSelectedAsset: (asset: AssetTypeCard) => void;
  removeSelectedAsset: (id: number) => void;
  updateSaleDetails: (id: number, details: Partial<ScenarioAssetSaleDetails>) => void;

  addReplacementAsset: (asset: ReplacementAsset) => void;
  removeReplacementAsset: (id: string) => void;

  computeScenario: () => void;
  setTaxSettings: (s: Partial<TaxSettings>) => void;
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

// --------------------- PROVIDER ------------------------

export const ScenarioProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAssets, setSelectedAssets] = useState<AssetTypeCard[]>([]);
  const [saleDetails, setSaleDetails] = useState<Record<number, ScenarioAssetSaleDetails>>({});
  const [replacementAssets, setReplacementAssets] = useState<ReplacementAsset[]>([]);
  const [computedResults, setComputedResults] = useState<TaxResultSummary | null>(null);

  const [taxSettings, setTaxSettingsState] = useState<TaxSettings>({
    marginalRate: 0.37,
    section179Limit: 1220000,
    bonusPercent: 100,
  });

  const addSelectedAsset = (asset: AssetTypeCard) => {
    setSelectedAssets((prev) => (prev.some((a) => a.id === asset.id) ? prev : [...prev, asset]));
  };

  const removeSelectedAsset = (id: number) => {
    setSelectedAssets((prev) => prev.filter((a) => a.id !== id));
    setSaleDetails((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const updateSaleDetails = (id: number, details: Partial<ScenarioAssetSaleDetails>) => {
    setSaleDetails((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...details },
    }));
  };

  const addReplacementAsset = (asset: ReplacementAsset) => {
    setReplacementAssets((prev) => [...prev, asset]);
  };

  const removeReplacementAsset = (id: string) => {
    setReplacementAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const setTaxSettings = (s: Partial<TaxSettings>) => {
    setTaxSettingsState((prev) => ({ ...prev, ...s }));
  };

  // ---------------- DETERMINISTIC ENGINE (Tier 2 - simplified IRS-like) ----------------
  // Description / rules used:
  // - Sale proceeds = sum(max(0, salePrice - fees))
  // - Replacement deductions compute:
  //    * Bonus (method = BONUS): apply full bonusPercent on business-use-adjusted cost
  //    * Section 179 (method = SECTION_179): limited by section179Limit (per-scenario simplified)
  //    * MACRS_GDS: simplified first-year rate: 20% (approx 5-year MACRS half-year convention)
  //    * MACRS_ADS: simplified straight-line first-year = 1/5 = 20% (simpler stand-in)
  // - Business use % scales deductions
  // - Tax savings = marginalRate * (bonus + section179 + macrs)
  // - Net cash flow = proceeds + taxSavings - totalReplacementCost
  // This is intentionally simplified and documented for future replacement with a tax policy service.

  const computeScenario = () => {
    let totalAssetValue = 0;
    let bonusDepreciation = 0;
    let section179 = 0;
    let macrsDepreciation = 0;

    // Sum liquidation proceeds (sale price minus fees)
    for (const asset of selectedAssets) {
      const sale = saleDetails[asset.id];
      if (!sale || typeof sale.salePrice !== "number") continue;
      const fees = sale.fees ?? 0;
      totalAssetValue += Math.max(0, (sale.salePrice ?? 0) - fees);
    }

    // Replacement deductions
    const { marginalRate, section179Limit, bonusPercent } = taxSettings;
    let section179Remaining = section179Limit;

    let totalReplacementCost = 0;

    for (const r of replacementAssets) {
      const businessAdj = r.cost * (Math.max(0, Math.min(100, r.businessUse)) / 100);
      totalReplacementCost += r.cost;

      if (r.method === "BONUS") {
        // bonusPercent is like 100 for 100%
        bonusDepreciation += businessAdj * (bonusPercent / 100);
      } else if (r.method === "SECTION_179") {
        // simplified single-scenario §179: assign up to cap
        const take = Math.min(businessAdj, section179Remaining);
        section179 += take;
        section179Remaining -= take;
      } else if (r.method === "MACRS_GDS") {
        // simplified MACRS GDS: assume 5-year class first-year factor 20%
        macrsDepreciation += businessAdj * 0.20;
      } else if (r.method === "MACRS_ADS") {
        // simplified ADS straight-line over 5 years -> first-year = 20%
        macrsDepreciation += businessAdj * 0.20;
      }
    }

    // Tax savings
    const taxSavings = (bonusDepreciation + section179 + macrsDepreciation) * marginalRate;

    // Net cash flow
    const netCashFlow = totalAssetValue + taxSavings - totalReplacementCost;

    setComputedResults({
      totalAssetValue,
      bonusDepreciation,
      section179,
      macrsDepreciation,
      taxSavings,
      netCashFlow,
    });
  };

  return (
    <ScenarioContext.Provider
      value={{
        selectedAssets,
        saleDetails,
        replacementAssets,
        computedResults,
        taxSettings,
        addSelectedAsset,
        removeSelectedAsset,
        updateSaleDetails,
        addReplacementAsset,
        removeReplacementAsset,
        computeScenario,
        setTaxSettings,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

// ---------------- HOOK ----------------------

export const useScenario = () => {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used within a ScenarioProvider");
  return ctx;
};
