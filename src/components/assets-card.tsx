"use client";

import { Trash2, Triangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useScenario } from "@/context/ScenarioContext";

export type AssetTypeCard = {
  id: number;
  category: string;
  asset: string;
  year: string;
  fair_market_value: number;
  book_value: number;
};

interface Props {
  asset: AssetTypeCard;
  onRemove: (id: number) => void;
}

const AssetsCard = ({ asset, onRemove }: Props) => {
  const { saleDetails, updateSaleDetails } = useScenario();

  // local state for inputs to avoid excessive context writes
  const existing = saleDetails[asset.id] ?? { salePrice: 0, fees: 0, closeMonth: "" };
  const [salePrice, setSalePrice] = useState<number>(existing.salePrice ?? 0);
  const [fees, setFees] = useState<number>(existing.fees ?? 0);
  const [closeMonth, setCloseMonth] = useState<string>(existing.closeMonth ?? "");

  // push local changes to context (debounced-ish by small timeout)
  useEffect(() => {
    const t = setTimeout(() => {
      updateSaleDetails(asset.id, { salePrice, fees, closeMonth });
    }, 150);
    return () => clearTimeout(t);
  }, [salePrice, fees, closeMonth]);

  const numericValue = Number(asset.fair_market_value);
  const formattedFMV = isNaN(numericValue)
    ? "0.00"
    : numericValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formattedBook = Number(asset.book_value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <li
      className="flex flex-col border border-gray-200 shadow-md shadow-zinc-400 
                 rounded-lg p-4 transition-transform duration-200 ease-in-out
                 hover:shadow-lg hover:-translate-y-0.5 bg-white"
    >
      <div className="flex justify-between items-center">
        <p className="font-bold text-gray-700">{asset.category}</p>

        <button onClick={() => onRemove(asset.id)} aria-label="Remove asset">
          <Trash2 className="text-gray-500 hover:text-red-500 transition" />
        </button>
      </div>

      <div className="flex justify-between mt-2">
        <div className="flex gap-2">
          <p className="font-bold">{asset.asset}</p>
          <p className="text-gray-500 font-semibold">{asset.year}</p>
        </div>
      </div>

      <div className="mt-1 w-full h-[1px] bg-gray-300"></div>

      <div className="flex flex-row gap-2 justify-around mt-4 mb-2 px-2">
        <ValueDisplay label="Fair Market Value" value={Number(asset.fair_market_value)} />
        <ValueDisplay label="Book Value" value={Number(asset.book_value)} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Sale Price</label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(Number(e.target.value))}
            className="border p-2 rounded"
            min={0}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Fees</label>
          <input
            type="number"
            value={fees}
            onChange={(e) => setFees(Number(e.target.value))}
            className="border p-2 rounded"
            min={0}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Close Month</label>
          <input
            type="month"
            value={closeMonth}
            onChange={(e) => setCloseMonth(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      </div>
    </li>
  );
};

type ValueDisplayProps = {
  label: string;
  value: number;
};

const ValueDisplay = ({ label, value }: ValueDisplayProps) => {
  const numericValue = Number(value);
  const formattedValue = isNaN(numericValue)
    ? "0.00"
    : numericValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div className="flex items-center">
        <p className="font-bold text-lg break-words">${formattedValue}</p>
      </div>

      <div className="flex items-center gap-1 mt-1">
        <span className="text-green-500 flex items-center">
          <Triangle width={12} height={12} />
        </span>
        <p className="font-bold text-sm">55%</p>
        <p className="font-bold text-sm text-gray-600">Last Month</p>
      </div>

      <p className="text-xs mt-1 text-center">{label}</p>
    </div>
  );
};

export default AssetsCard;
