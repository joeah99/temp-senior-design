"use client";

import React from "react";
import { LoanInformationDTO } from "@/types/loans";
import { Edit, Trash2 } from "lucide-react";

interface SimpleAsset {
    id: number;
    name: string;
}

interface LoansTableProps {
    loans: LoanInformationDTO[];
    assets: SimpleAsset[];
    onEdit: (loan: LoanInformationDTO) => void;
    onDelete: (loan: LoanInformationDTO) => void;
}

const LoansTable = ({ loans, assets, onEdit, onDelete }: LoansTableProps) => {
    if (loans.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No loans found. Click "Add Loan" to get started.</p>
            </div>
        );
    }

    const getAssetName = (assetId: number | null | undefined) => {
        if (!assetId) return null;
        const asset = assets.find(a => a.id === assetId);
        return asset ? asset.name : "Unknown Asset";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loans.map((loan) => (
                <div key={loan.loan_id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{loan.loan_name}</h3>
                            <p className="text-sm text-gray-500">{loan.lender_name}</p>
                            {loan.loan_start_date && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Opened: {new Date(loan.loan_start_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {loan.loan_type}
                        </span>
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-4" />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">

                        {/* Balance */}
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Balance</p>
                            <p className="font-bold text-gray-900 text-lg">
                                ${loan.remaining_balance.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                                of ${loan.loan_amount.toLocaleString()}
                            </p>
                        </div>

                        {/* Payment */}
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Monthly Payment</p>
                            <p className="font-bold text-gray-900 text-lg">
                                ${loan.monthly_payment.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                                / month
                            </p>
                        </div>

                        {/* Rate / Term */}
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Rate & Term</p>
                            <div className="flex items-baseline gap-1">
                                <span className="font-medium text-gray-900">{loan.interest_rate}%</span>
                                <span className="text-xs text-gray-400">for {loan.loan_term_years} yrs</span>
                            </div>
                        </div>

                        {/* Payoff Date (Approx) */}
                        <div className="text-right">
                            {/* Placeholder for payoff date if we calculate it here or in DTO */}
                        </div>

                    </div>

                    {/* Linked Asset */}
                    {loan.asset_id && (
                        <div className="mb-4 bg-gray-50 rounded p-2 flex items-center gap-2 border border-gray-100">
                            <span className="text-blue-500 text-xs">🔗</span>
                            <span className="text-sm text-gray-700 font-medium truncate">
                                {getAssetName(loan.asset_id)}
                            </span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-auto pt-2 border-t border-gray-100">
                        <button
                            onClick={() => onEdit(loan)}
                            className="p-2 text-gray-500 hover:text-dpa-dark-green hover:bg-green-50 rounded-full transition-colors"
                            aria-label="Edit Loan"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(loan)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Delete Loan"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                </div>
            ))}
        </div>
    );
};

export default LoansTable;
