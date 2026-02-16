"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AssetTypeCard } from "@/components/assets-card";
import { useAuth } from "@/context/AuthContext";

// ---- TYPES ----
export interface ScenarioAssetSaleDetails {
  salePrice?: number;
  fees?: number;
  closeMonth?: string;
  accumulatedDepreciation?: number;
}

export type ReplacementMethod =
  | "BONUS"
  | "SECTION_179"
  | "MACRS_GDS"
  | "MACRS_ADS"
  | "AUTO";

export interface ReplacementAsset {
  id: string;
  name: string;
  cost: number;
  method: ReplacementMethod;
  businessUse: number;
  inServiceMonth: string;
  purchaseType?: "REPLACEMENT" | "NEW";
  usefulLife?: number;
}

export interface ScenarioResultsFromBackend {
  totalSaleProceeds: number;
  totalTransactionFees: number;
  totalSection1245Recapture: number;
  totalSection1231Gain: number;
  totalTaxOnSales: number;
  netCashFromLiquidation: number;
  totalReplacementCost: number;
  totalBonusDepreciation: number;
  totalSection179: number;
  totalMacrsFirstYear: number;
  totalFirstYearDeductions: number;
  taxSavingsFromDeductions: number;
  cashRequiredForReplacements: number;
  netCashFlow: number;
  saleDetails: any[];
  replacementDetails: any[];
  calculatedAt: string;
  taxYear: number;
  warnings: string[];
}

export interface TaxSettings {
  marginalRate: number | "";
  section179Limit: number | "";
  bonusPercent: number | "";
  capitalGainsRate: number;
}

interface ScenarioContextType {
  selectedAssets: AssetTypeCard[];
  allAssets: AssetTypeCard[]; // NEW
  setAllAssets: (assets: AssetTypeCard[]) => void; // NEW

  saleDetails: Record<number, ScenarioAssetSaleDetails>;
  replacementAssets: ReplacementAsset[];
  computedResults: ScenarioResultsFromBackend | null;
  taxSettings: TaxSettings;
  loading: boolean;

  addSelectedAsset: (asset: AssetTypeCard) => void;
  removeSelectedAsset: (id: number) => void;
  updateSaleDetails: (id: number, details: Partial<ScenarioAssetSaleDetails>) => void;

  addReplacementAsset: (asset: ReplacementAsset) => void;
  removeReplacementAsset: (id: string) => void;

  refreshSelectedAsset: (asset: AssetTypeCard) => void; // NEW

  computeScenario: () => Promise<void>;
  setTaxSettings: (s: Partial<TaxSettings>) => void;
}

const ScenarioContext = createContext<ScenarioContextType | null>(null);

// ------------------------------------------------------------
// PROVIDER
// ------------------------------------------------------------

export const ScenarioProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [selectedAssets, setSelectedAssets] = useState<AssetTypeCard[]>([]);

  // NEW: Global cached assets so they don't reload on tab switch
  const [allAssets, setAllAssets] = useState<AssetTypeCard[]>([]);

  const [saleDetails, setSaleDetails] =
    useState<Record<number, ScenarioAssetSaleDetails>>({});

  const [replacementAssets, setReplacementAssets] = useState<ReplacementAsset[]>([]);

  const [computedResults, setComputedResults] =
    useState<ScenarioResultsFromBackend | null>(null);

  const [taxSettings, setTaxSettingsState] = useState<TaxSettings>({
    marginalRate: "",
    section179Limit: "",
    bonusPercent: "",
    capitalGainsRate: 0.15,
  });

  const [loading, setLoading] = useState(false);

  // Reset results when inputs change
  const clearResults = () => setComputedResults(null);

  const addSelectedAsset = (asset: AssetTypeCard) => {
    setSelectedAssets(prev =>
      prev.some(a => a.id === asset.id) ? prev : [...prev, asset]
    );
    clearResults();
  };

  const removeSelectedAsset = (id: number) => {
    setSelectedAssets(prev => prev.filter(a => a.id !== id));
    setSaleDetails(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    clearResults();
  };

  const updateSaleDetails = (id: number, details: Partial<ScenarioAssetSaleDetails>) => {
    setSaleDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], ...details },
    }));
    clearResults();
  };

  const addReplacementAsset = (asset: ReplacementAsset) => {
    setReplacementAssets(prev => [...prev, asset]);
    clearResults();
  };

  const removeReplacementAsset = (id: string) => {
    setReplacementAssets(prev => prev.filter(a => a.id !== id));
    clearResults();
  };

  // NEW: Update an item in selectedAssets (in-place) to reflect edits
  const refreshSelectedAsset = (asset: AssetTypeCard) => {
    setSelectedAssets(prev =>
      prev.map(a => (a.id === asset.id ? asset : a))
    );
    // If values changed (e.g. FMV), results might change if we use FMV.
    clearResults();
  };

  const setTaxSettings = (s: Partial<TaxSettings>) => {
    setTaxSettingsState(prev => ({ ...prev, ...s }));
    clearResults();
  };

  // ------------------------------------------------------------
  // CALL BACKEND FOR CALCULATION
  // ------------------------------------------------------------
  const computeScenario = useCallback(async () => {
    setLoading(true);

    try {
      const api = process.env.NEXT_PUBLIC_API_URL;

      const assetsToSell = selectedAssets.map(asset => {
        const sale = saleDetails[asset.id] || {};
        return {
          assetId: asset.id,
          assetName: asset.asset,
          originalCost: asset.purchase_price || asset.book_value,
          accumulatedDepreciation: (asset.purchase_price || asset.book_value) - asset.book_value,
          salePrice: sale.salePrice || 0,
          transactionFees: sale.fees || 0,
          closeMonth: sale.closeMonth || "",
        };
      });

      const replacementAssetsPayload = replacementAssets.map(r => ({
        name: r.name,
        cost: r.cost,
        method: r.method,
        businessUsePercent: r.businessUse,
        inServiceMonth: r.inServiceMonth,
        usefulLife: r.usefulLife || 5,
      }));

      const payload = {
        userId: user?.user_id || 0,
        assetsToSell,
        replacementAssets: replacementAssetsPayload,
        marginalTaxRate: Number(taxSettings.marginalRate) || 0,
        capitalGainsRate: taxSettings.capitalGainsRate,
        businessIncomeLimit: null,
        overrideSection179Limit: Number(taxSettings.section179Limit) || null,
        overrideBonusPercent: Number(taxSettings.bonusPercent) || null,
      };

      const res = await fetch(`${api}/scenarios/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail?.message || "Calculation failed");
      }

      const results: ScenarioResultsFromBackend = await res.json();
      setComputedResults(results);

    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedAssets, saleDetails, replacementAssets, taxSettings, user]);

  // ------------------------------------------------------------
  return (
    <ScenarioContext.Provider
      value={{
        selectedAssets,
        allAssets,      // NEW
        setAllAssets,   // NEW

        saleDetails,
        replacementAssets,
        computedResults,
        taxSettings,
        loading,

        addSelectedAsset,
        removeSelectedAsset,
        updateSaleDetails,

        addReplacementAsset,
        removeReplacementAsset,
        refreshSelectedAsset,

        computeScenario,
        setTaxSettings,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

// ------------------------------------------------------------
// HOOK
// ------------------------------------------------------------
export const useScenario = () => {
  const ctx = useContext(ScenarioContext);
  if (!ctx)
    throw new Error("useScenario must be used within a ScenarioProvider");
  return ctx;
};
