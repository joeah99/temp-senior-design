import React from "react";
import { AssetTypeCard } from "./assets-card";

interface Props {
  allAssets: AssetTypeCard[];
  onSelect: (asset: AssetTypeCard) => void;
  onClose: () => void;
}

const SelectAssetsModal = ({ allAssets, onSelect, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-4 rounded shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Select an Asset</h3>

        <ul className="max-h-64 overflow-y-auto border p-2 rounded">
          {allAssets.map((asset) => (
            <li
              key={asset.id}
              onClick={() => onSelect(asset)}
              className="p-2 hover:bg-zinc-100 cursor-pointer rounded"
            >
              {asset.asset} ({asset.year})
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-zinc-200 py-1 rounded hover:bg-zinc-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SelectAssetsModal;
