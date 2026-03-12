"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LoanInformationDTO } from "@/types/loans";

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

interface SimpleAsset {
    id: number | string; // Support composite IDs like "asset-123" or "purchase-456"
    name: string;
    purchasePrice?: number; // Optional purchase price for LTV calculation
}

interface LoanDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    loanToEdit?: LoanInformationDTO | null;
    assets: SimpleAsset[];
    onSave: (loan: any) => Promise<void>;
}

const LoanDrawer = ({ isOpen, onClose, loanToEdit, assets, onSave }: LoanDrawerProps) => {
    const [formData, setFormData] = useState({
        lender_name: "",
        loan_name: "",
        loan_type: "Term Loan",
        loan_amount: "",
        interest_rate: "",
        loan_term_years: "",
        remaining_balance: "",
        monthly_payment: "",
        payment_frequency: "Monthly",
        status: "Active",
        loan_start_month: "",
        loan_start_year: "",
        asset_id: "", // New field
        ltv: "", // New field for Loan-to-Value
    });

    const [expectedPayoff, setExpectedPayoff] = useState("");

    // Auto-calculate payment
    useEffect(() => {
        const P = parseFloat(formData.remaining_balance || formData.loan_amount || "0");
        const r = (parseFloat(formData.interest_rate || "0") / 100) / 12;
        const n = (parseFloat(formData.loan_term_years || "0") * 12);

        let pmt = 0;
        if (formData.loan_type === "Lease") {
            // Lease: Do not auto-calculate. User enters manually.
            return;
        } else {
            // Standard Term Loan Amortization
            if (P > 0 && r > 0 && n > 0) {
                pmt = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            } else if (P > 0 && n > 0 && r === 0) {
                pmt = P / n;
            }
        }

        if (pmt > 0) {
            const rounded = Math.round(pmt).toString();
            // Avoid infinite loops by checking current value
            if (rounded !== formData.monthly_payment) {
                setFormData(prev => ({ ...prev, monthly_payment: rounded }));
            }
        }
    }, [formData.remaining_balance, formData.loan_amount, formData.interest_rate, formData.loan_term_years, formData.loan_type]);

    // Calculate payoff date
    useEffect(() => {
        if (formData.loan_start_year && formData.loan_start_month && formData.loan_term_years) {
            const startYear = parseInt(formData.loan_start_year);
            const term = parseInt(formData.loan_term_years);
            const monthIdx = parseInt(formData.loan_start_month) - 1; // 0-based

            if (!isNaN(startYear) && !isNaN(term) && !isNaN(monthIdx)) {
                // simple payoff: start + term years
                // technically if you start Jan 1 2024, 1 year term ends Jan 1 2025 (or Dec 31 2024). 
                // "Expected Payoff Date" usually implies the final payment date.
                // We'll just add the years.
                const payoffYear = startYear + term;
                const date = new Date(payoffYear, monthIdx);
                const monthName = date.toLocaleString('default', { month: 'short' });
                setExpectedPayoff(`${monthName} ${payoffYear}`);
                return;
            }
        }
        setExpectedPayoff("");
    }, [formData.loan_start_year, formData.loan_start_month, formData.loan_term_years]);

    // Auto-calculate LTV if an asset is selected and has a purchase price
    useEffect(() => {
        if (formData.asset_id && formData.loan_amount) {
            const asset = assets.find(a => String(a.id) === String(formData.asset_id));
            if (asset && asset.purchasePrice && asset.purchasePrice > 0) {
                const amount = parseFloat(formData.loan_amount);
                if (!isNaN(amount)) {
                    const ltvValue = (amount / asset.purchasePrice) * 100;
                    const roundedLtv = ltvValue.toFixed(2);
                    // Avoid infinite loop by only updating if it changed
                    if (roundedLtv !== formData.ltv) {
                        setFormData(prev => ({ ...prev, ltv: roundedLtv }));
                    }
                    return;
                }
            }
        }
    }, [formData.asset_id, formData.loan_amount, assets]);

    useEffect(() => {
        if (loanToEdit) {
            const dateParts = loanToEdit.loan_start_date ? loanToEdit.loan_start_date.split("-") : ["", ""];

            // Reconstruct composite ID from linked_type and linked_id
            let assetId = "";
            if (loanToEdit.linked_type && loanToEdit.linked_id) {
                assetId = `${loanToEdit.linked_type}-${loanToEdit.linked_id}`;
            }

            setFormData({
                lender_name: loanToEdit.lender_name,
                loan_name: loanToEdit.loan_name,
                loan_type: loanToEdit.loan_type,
                loan_amount: loanToEdit.loan_amount.toString(),
                interest_rate: loanToEdit.interest_rate.toString(),
                loan_term_years: loanToEdit.loan_term_years.toString(),
                remaining_balance: loanToEdit.remaining_balance.toString(),
                monthly_payment: loanToEdit.monthly_payment.toString(),
                payment_frequency: loanToEdit.payment_frequency,
                status: loanToEdit.status,
                loan_start_year: dateParts[0] || "",
                loan_start_month: dateParts[1] || "",
                asset_id: assetId,
                ltv: loanToEdit.ltv != null ? loanToEdit.ltv.toString() : "",
            });
        } else {
            setFormData({
                lender_name: "",
                loan_name: "",
                loan_type: "Term Loan",
                loan_amount: "",
                interest_rate: "",
                loan_term_years: "",
                remaining_balance: "",
                monthly_payment: "",
                payment_frequency: "Monthly",
                status: "Active",
                loan_start_month: "",
                loan_start_year: "",
                asset_id: "",
                ltv: "",
            });
        }
    }, [loanToEdit, isOpen]);

    // Clear fields when switching to Lease
    useEffect(() => {
        if (formData.loan_type === "Lease") {
            setFormData(prev => ({
                ...prev,
                loan_amount: "",
                remaining_balance: "",
                interest_rate: ""
            }));
        }
    }, [formData.loan_type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const onlyDigits = (str: string) => str.replace(/[^\d]/g, "").slice(0, 9);

    const formatNum = (val: string) => {
        if (!val) return "";
        return Number(val).toLocaleString("en-US");
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const cleanVal = onlyDigits(value);
        setFormData(prev => ({ ...prev, [name]: cleanVal }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle defaults for Lease
        const amount = formData.loan_type === "Lease" ? 0 : parseFloat(formData.loan_amount);
        const rate = formData.loan_type === "Lease" ? 0 : parseFloat(formData.interest_rate);
        const balance = formData.loan_type === "Lease" ? 0 : parseFloat(formData.remaining_balance);

        await onSave({
            ...formData,
            loan_amount: isNaN(amount) ? 0 : amount,
            interest_rate: isNaN(rate) ? 0 : rate,
            loan_term_years: parseInt(formData.loan_term_years) || 0,
            remaining_balance: isNaN(balance) ? 0 : balance,
            monthly_payment: parseFloat(formData.monthly_payment) || 0,
            loan_start_date: formData.loan_start_year && formData.loan_start_month ? `${formData.loan_start_year}-${formData.loan_start_month}-01` : null,
            loan_id: loanToEdit?.loan_id,
            asset_id: formData.asset_id,
            ltv: formData.ltv ? parseFloat(formData.ltv) : null
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {loanToEdit ? "Edit Loan" : "Add New Loan"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6" autoComplete="off">
                    {/* Loan Name & Lender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lender Name</label>
                            <input
                                type="text"
                                name="lender_name"
                                value={formData.lender_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loan Name / Reference</label>
                            <input
                                type="text"
                                name="loan_name"
                                value={formData.loan_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Loan Type & Asset Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loan Type</label>
                            <select
                                name="loan_type"
                                value={formData.loan_type}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            >
                                <option value="Term Loan">Term Loan</option>
                                <option value="Line of Credit">Line of Credit</option>
                                <option value="Mortgage">Mortgage</option>
                                <option value="Lease">Lease / Finance Lease</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Linked Asset (Optional)</label>
                            <select
                                name="asset_id"
                                value={formData.asset_id}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            >
                                <option value="">-- None --</option>
                                {assets.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">Link this loan to a specific asset or purchase.</p>
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Loan Start Date</label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                            <select
                                name="loan_start_month"
                                value={formData.loan_start_month}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            >
                                <option value="">Month</option>
                                {MONTHS.map(m => m.value && <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="loan_start_year"
                                value={formData.loan_start_year}
                                onChange={(e) => {
                                    const val = onlyDigits(e.target.value).slice(0, 4);
                                    setFormData(prev => ({ ...prev, loan_start_year: val }));
                                }}
                                className="block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            />
                        </div>
                    </div>

                    {/* Financials Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Original Loan Amount</label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="loan_amount"
                                    value={formatNum(formData.loan_amount)}
                                    onChange={handleCurrencyChange}
                                    disabled={formData.loan_type === "Lease"}
                                    className={`block w-full rounded-md border-gray-300 pl-7 border p-2 ${formData.loan_type === "Lease" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                                    required={formData.loan_type !== "Lease"}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="remaining_balance"
                                    value={formatNum(formData.remaining_balance)}
                                    onChange={handleCurrencyChange}
                                    disabled={formData.loan_type === "Lease"}
                                    className={`block w-full rounded-md border-gray-300 pl-7 border p-2 ${formData.loan_type === "Lease" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                                    required={formData.loan_type !== "Lease"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financials Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="interest_rate"
                                value={formData.interest_rate}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^\d.]/g, "");
                                    if (val.length <= 5) {
                                        setFormData(prev => ({ ...prev, interest_rate: val }));
                                    }
                                }}
                                disabled={formData.loan_type === "Lease"}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 ${formData.loan_type === "Lease" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                                required={formData.loan_type !== "Lease"}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Term (Years)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="loan_term_years"
                                value={formData.loan_term_years}
                                onChange={(e) => {
                                    const val = onlyDigits(e.target.value).slice(0, 2);
                                    setFormData(prev => ({ ...prev, loan_term_years: val }));
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Financials Row 3: LTV & Monthly Payment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LTV */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">LTV (%)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="ltv"
                                value={formData.ltv}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^\d.]/g, "");
                                    if (val.length <= 6) {
                                        setFormData(prev => ({ ...prev, ltv: val }));
                                    }
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            />
                        </div>

                        {/* Monthly Payment */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Monthly Payment</label>
                                {expectedPayoff && (
                                    <span className="text-xs text-gray-500">
                                        Expected Payoff: {expectedPayoff}
                                    </span>
                                )}
                            </div>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="monthly_payment"
                                    value={formatNum(formData.monthly_payment)}
                                    onChange={handleCurrencyChange}
                                    className="block w-full rounded-md border-gray-300 pl-7 border p-2 bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-3 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-dpa-dark-green py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-green-800 focus:outline-none transition-colors shadow-sm"
                        >
                            {loanToEdit ? "Save Changes" : "Add Loan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanDrawer;
