"use client";

import { useEffect, useState } from "react";
import AssetsCard, { AssetTypeCard } from "./assets-card";
import SelectAssetsModal from "./select-assets-modal";
import CreateAssetModal from "./create-asset-modal";
import { useScenario } from "@/context/ScenarioContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const SelectAssets = () => {
  const { selectedAssets, addSelectedAsset, removeSelectedAsset, refreshSelectedAsset } = useScenario();
  const { user } = useAuth();

  const { allAssets, setAllAssets } = useScenario();
  const [loading, setLoading] = useState(true);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null); // Asset to edit
  const router = useRouter();

  const loadAssets = async () => {
    if (!user) return;

    try {
      const api = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${api}/GetAssets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id }),
      });

      if (!res.ok) {
        console.error("Failed to fetch assets:", await res.text());
        setLoading(false);
        return;
      }

      const data = await res.json();

      const mapped: AssetTypeCard[] = data.map((asset: any) => {
        const latestFMV = asset.FMV ?? 0;

        return {
          id: asset.AssetId,
          category: asset.Type,
          asset: `${asset.Manufacturer} ${asset.Model}`,
          year: asset.ModelYear,
          fair_market_value: latestFMV,
          book_value: asset.BookValue,
          purchase_price: asset.PurchasePrice,
          originalData: asset, // Store full object for editing
        };
      });

      setAllAssets(mapped);
      return mapped; // Return for immediate use
    } catch (err) {
      console.error("Error loading assets:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && allAssets.length === 0) {
      loadAssets();
    } else if (allAssets.length > 0) {
      setLoading(false);
    }
  }, [user, allAssets.length]); // Re-run when user loads

  const handleSelectAsset = (asset: AssetTypeCard) => {
    addSelectedAsset(asset);
    setShowSelectModal(false);
  };

  const handleEdit = (asset: AssetTypeCard) => {
    if (asset.originalData) {
      setEditingAsset(asset.originalData);
      setShowCreateModal(true);
    }
  };

  const handleAssetCreated = async () => {
    setShowCreateModal(false);
    setLoading(true);

    // 1. Reload global list (gets the new data from DB)
    const freshAssets = await loadAssets();

    // 2. If we were editing an asset, update it in the "Selected" list too
    if (editingAsset && freshAssets) {
      const freshVersion = freshAssets.find((a: AssetTypeCard) => a.id === editingAsset.AssetId);
      if (freshVersion) {
        refreshSelectedAsset(freshVersion);
      }
    }

    // Clear editing state
    setEditingAsset(null);
  };

  return (
    <section id="select-assets" className="min-h-screen">
      <div className="flex flex-row items-center justify-between mb-8">
        <h2 className="scenario-heading">Select Assets to Liquidate</h2>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-dpa-dark-green text-white font-semibold p-2 px-4 rounded-full hover:bg-green-800 flex items-center gap-2"
          >
            {selectedAssets.length === 0 ? "Add Asset" : "Add More"}
            <span className="text-sm">▼</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setShowSelectModal(true);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-t-lg"
              >
                <div className="font-semibold">Select Existing Asset</div>
              </button>
              <div className="border-t border-gray-200"></div>
              <button
                onClick={() => {
                  setEditingAsset(null); // Ensure we are in create mode
                  setShowCreateModal(true);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-b-lg"
              >
                <div className="font-semibold">Create New Asset</div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {showSelectModal && (
        <SelectAssetsModal
          allAssets={allAssets}
          onSelect={handleSelectAsset}
          onClose={() => setShowSelectModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateAssetModal
          initialData={editingAsset}
          onSuccess={handleAssetCreated}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAsset(null);
          }}
        />
      )}

      <p className="text-zinc-700 mb-4">
        Choose which assets you want to sell and set expected sale details like
        price, fees, and closing month
      </p>

      {selectedAssets.length === 0 ? (
        <div className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <p>No assets selected.</p>
          )}
          <button
            onClick={() => {
              // Navigate to next step (replacement purchases) - same as Next button
              router.push("?step=replacement-purchases", { scroll: false });
            }}
            className="bg-dpa-dark-green text-white font-semibold p-2 px-4 rounded-full hover:bg-green-800 flex items-center gap-2"
          >
            Buy Only
          </button>
        </div>
      ) : (
        <ul className="scenario-card-grid">
          {selectedAssets.map((asset: AssetTypeCard) => (
            <AssetsCard
              key={asset.id}
              asset={asset}
              onRemove={removeSelectedAsset}
              onEdit={handleEdit}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default SelectAssets;
