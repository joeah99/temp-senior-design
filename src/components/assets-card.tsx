"use client";

import { X, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useScenario } from "@/context/ScenarioContext";

export type AssetTypeCard = {
  id: number;
  category: string;
  asset: string;
  year: string;
  fair_market_value: number;
  book_value: number;
  purchase_price: number;
  originalData?: any; // Full asset object for editing
};

interface Props {
  asset: AssetTypeCard;
  onRemove: (id: number) => void;
  onEdit: (asset: AssetTypeCard) => void;
}

const MONTHS = [
  { label: "", value: "" },
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

const AssetsCard = ({ asset, onRemove, onEdit }: Props) => {
  const { saleDetails, updateSaleDetails } = useScenario();

  const existing = saleDetails[asset.id] ?? {
    salePrice: 0,
    fees: 0,
    closeMonth: "",
  };

  const [salePrice, setSalePrice] = useState<string>(
    existing.salePrice ? existing.salePrice.toString() : ""
  );
  const [fees, setFees] = useState<string>(
    existing.fees ? existing.fees.toString() : ""
  );

  const initialMonth = existing.closeMonth ? existing.closeMonth.split("-")[1] : "";
  const initialYear = existing.closeMonth ? existing.closeMonth.split("-")[0] : "";
  const [month, setMonth] = useState<string>(initialMonth);
  const [year, setYear] = useState<string>(initialYear);

  // sync → ScenarioContext
  useEffect(() => {
    const t = setTimeout(() => {
      updateSaleDetails(asset.id, {
        salePrice: salePrice ? Number(salePrice) : 0,
        fees: fees ? Number(fees) : 0,
        closeMonth: month && year ? `${year}-${month}` : "",
      });
    }, 150);
    return () => clearTimeout(t);
  }, [salePrice, fees, month, year, asset.id, updateSaleDetails]);

  const formatNum = (val: string) =>
    val === "" ? "" : Number(val).toLocaleString("en-US");

  const onlyDigits = (str: string) => str.replace(/[^\d]/g, "");

  return (
    <li className="flex flex-col gap-4 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md bg-white transition-all">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-gray-700">{asset.category}</p>
          <div className="flex gap-2 items-baseline mt-1">
            <p className="font-semibold text-lg">{asset.asset}</p>
            <p className="text-sm text-gray-500">{asset.year}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onEdit(asset)}
            aria-label="Edit asset"
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <Pencil className="w-5 h-5 text-gray-500 hover:text-blue-500" />
          </button>
          <button
            onClick={() => onRemove(asset.id)}
            aria-label="Remove asset"
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* FMV + Book Value */}
      <div className="grid grid-cols-2 gap-4">
        <ValueDisplay label="Fair Market Value" value={asset.fair_market_value} />
        <ValueDisplay label="Book Value" value={asset.book_value} />
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <InputField
          label="Sale Price"
          value={formatNum(salePrice)}
          onChange={(v) => setSalePrice(onlyDigits(v))}
        />

        <InputField
          label="Fees"
          value={formatNum(fees)}
          onChange={(v) => setFees(onlyDigits(v))}
        />

        {/* Close Month */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Close Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-md p-2 w-full h-10 bg-white"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Close Year */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Close Year</label>
          <input
            inputMode="numeric"
            type="text"
            maxLength={4}
            value={year}
            onChange={(e) => setYear(onlyDigits(e.target.value).slice(0, 4))}
            placeholder="YYYY"
            className="border rounded-md p-2 w-full h-10 transition-all text-base"
            autoComplete="off"
          />
        </div>
      </div>
    </li>
  );
};

const InputField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const getFontSizeClass = (val: string) => {
    const len = val.length;
    if (len > 7) return "text-[13px]";
    if (len > 6) return "text-[14px]";
    return "text-base"; // Default
  };

  return (
    <div>
      <label className="text-xs text-gray-600 mb-1 block">{label}</label>
      <input
        inputMode="numeric"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`border rounded-md p-2 w-full h-10 transition-all ${getFontSizeClass(
          value
        )}`}
        autoComplete="off"
      />
    </div>
  );
};

const ValueDisplay = ({ label, value }: { label: string; value: number }) => {
  const formatted = value.toLocaleString("en-US");

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-xl">${formatted}</p>
    </div>
  );
};

export default AssetsCard;
