"use client";

import { useEffect, useState } from "react";
import AssetsCard, { AssetTypeCard } from "./assets-card";
import SelectAssetsModal from "./select-assets-modal";
import { useScenario } from "@/context/ScenarioContext";

const SelectAssets = () => {
  const { selectedAssets, addSelectedAsset, removeSelectedAsset } = useScenario();

  const [allAssets, setAllAssets] = useState<AssetTypeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${api}/GetAssets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(1),
        });

        if (!res.ok) {
          console.error("Failed to fetch assets:", await res.text());
          setLoading(false);
          return;
        }

        const data = await res.json();

        const mapped: AssetTypeCard[] = data.map((asset: any) => {
          const latestFMV =
            asset.fairMarketValuesOverTime?.[
              asset.fairMarketValuesOverTime.length - 1
            ]?.value ?? 0;

          return {
            id: asset.assetId,
            category: asset.type,
            asset: `${asset.manufacturer} ${asset.model}`,
            year: asset.modelYear,
            fair_market_value: latestFMV,
            book_value: asset.bookValue,
          };
        });

        setAllAssets(mapped);
      } catch (err) {
        console.error("Error loading assets:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, []);

  const handleSelectAsset = (asset: AssetTypeCard) => {
    addSelectedAsset(asset);
    setShowModal(false);
  };

  return (
    <section id="select-assets" className="min-h-screen">
      <div className="flex flex-row items-center justify-between mb-8">
        <h2 className="scenario-heading">Select Assets to Liquidate</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-dpa-dark-green text-white font-semibold p-2 px-4 rounded-full hover:bg-green-800"
        >
          {selectedAssets.length === 0 ? "Add Asset" : "Add More"}
        </button>
      </div>

      {showModal && (
        <SelectAssetsModal
          allAssets={allAssets}
          onSelect={handleSelectAsset}
          onClose={() => setShowModal(false)}
        />
      )}

      <p className="text-zinc-700 mb-4">
        Choose which assets you want to sell and set expected sale details like
        price, fees, and closing month
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : selectedAssets.length === 0 ? (
        <p>No assets selected.</p>
      ) : (
        <ul className="scenario-card-grid">
          {selectedAssets.map((asset: AssetTypeCard) => (
            <AssetsCard
              key={asset.id}
              asset={asset}
              onRemove={removeSelectedAsset}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default SelectAssets;