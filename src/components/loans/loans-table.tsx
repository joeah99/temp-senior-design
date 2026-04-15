"use client";

import React from "react";
import { LoanInformationDTO } from "@/types/loans";
import { Edit, Trash2 } from "lucide-react";

interface SimpleAsset {
    id: number | string; // Support composite IDs like "asset-123" or "purchase-456"
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

    const getAssetName = (assetId: number | string | null | undefined) => {
        if (!assetId) return null;
        const asset = assets.find(a => String(a.id) === String(assetId));
        return asset ? asset.name : "Unknown Asset";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
                <div key={loan.loan_id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                    <div className="p-6 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4 mt-1">
                            <div className="pr-2">
                                <h3 className="font-bold text-gray-900 text-xl leading-snug mb-1 group-hover:text-indigo-900 transition-colors">{loan.loan_name}</h3>
                                <p className="text-sm text-gray-500 font-medium">{loan.lender_name}</p>
                            </div>
                            <span className="px-3 py-1 flex-shrink-0 text-[11px] uppercase tracking-wider font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {loan.loan_type}
                            </span>
                        </div>

                        {/* Linked Asset */}
                        <div className="mb-5 min-h-[32px]">
                            {(loan.linked_type && loan.linked_id) && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-600 shadow-sm">
                                    <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                    </svg>
                                    <span className="truncate max-w-[200px]">
                                        {getAssetName(`${loan.linked_type}-${loan.linked_id}`)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stats Container - Soft shaded box */}
                        <div className="bg-gray-50/80 rounded-xl p-4 grid grid-cols-2 gap-y-5 gap-x-4 mb-5 border border-gray-100/60 shadow-inner">
                            {/* Balance */}
                            <div>
                                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Balance</p>
                                <p className="font-extrabold text-gray-900 text-lg tracking-tight">
                                    ${loan.remaining_balance.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                    of ${loan.loan_amount.toLocaleString()}
                                </p>
                            </div>

                            {/* Payment */}
                            <div className="text-right">
                                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Payment</p>
                                <p className="font-extrabold text-gray-900 text-lg tracking-tight text-blue-600">
                                    ${loan.monthly_payment.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                    / month
                                </p>
                            </div>

                            {/* Rate / Term */}
                            <div>
                                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Terms</p>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                    <span className="font-extrabold text-gray-800 text-base">{loan.interest_rate}%</span>
                                    <span className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase">{loan.loan_term_years} yrs</span>
                                </div>
                            </div>

                            {/* LTV */}
                            <div className="text-right">
                                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">LTV</p>
                                {loan.ltv != null ? (
                                    <div className="mt-1">
                                        <span className="font-extrabold text-gray-900 text-base">
                                            {loan.ltv}%
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 font-medium">-</span>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                            {loan.loan_start_date ? (
                                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    Opened {new Date(loan.loan_start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </p>
                            ) : <div />}

                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => onEdit(loan)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                    aria-label="Edit Loan"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(loan)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    aria-label="Delete Loan"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoansTable;
