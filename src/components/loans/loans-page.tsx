"use client";

import React, { useState, useEffect } from "react";
import LoansTable from "./loans-table";
import LoanDrawer from "./loan-drawer";
import { LoanInformationDTO } from "@/types/loans";
import AiLoanUploadModal from "../upload/ai-loan-upload-modal";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE_URL = "http://localhost:8000";

export interface SimpleAsset {
    id: number | string; // Support composite IDs like "asset-123" or "purchase-456"
    name: string;
    purchasePrice?: number;
    fmv?: number; // Primary source for LTV
}

const LoansPage = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState<LoanInformationDTO[]>([]);
    const [assets, setAssets] = useState<SimpleAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<LoanInformationDTO | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        try {
            // Fetch Loans
            const loansRes = await fetch(`${API_BASE_URL}/loans?user_id=${user.user_id}`);
            if (loansRes.ok) {
                setLoans(await loansRes.json());
            } else {
                console.error("Failed to fetch loans");
            }

            // Fetch Assets
            const assetsRes = await fetch(`${API_BASE_URL}/GetAssets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.user_id }),
            });

            const mappedAssets: SimpleAsset[] = [];
            if (assetsRes.ok) {
                const rawAssets = await assetsRes.json();
                // Map to SimpleAsset with asset- prefix (NO display prefix)
                mappedAssets.push(...rawAssets.map((a: any) => ({
                    id: `asset-${a.AssetId}`, // Composite ID
                    name: `${a.ModelYear} ${a.Manufacturer} ${a.Model}`,
                    purchasePrice: a.PurchasePrice,
                    fmv: a.FMV ?? 0
                })));
            } else {
                console.error("Failed to fetch assets");
            }

            // Fetch Purchases
            const purchasesRes = await fetch(`${API_BASE_URL}/purchases?user_id=${user.user_id}`);
            if (purchasesRes.ok) {
                const rawPurchases = await purchasesRes.json();
                // Map to SimpleAsset with purchase- prefix (NO display prefix)
                mappedAssets.push(...rawPurchases.map((p: any) => ({
                    id: `purchase-${p.purchase_id}`, // Composite ID
                    name: p.asset_name,
                    purchasePrice: p.cost
                })));
            } else {
                console.error("Failed to fetch purchases");
            }

            // Set combined list
            setAssets(mappedAssets);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const handleSaveLoan = async (loanData: any) => {
        if (!user) return;

        // Parse composite ID to linked_type and linked_id
        let linked_type = null;
        let linked_id = null;
        if (loanData.asset_id) {
            const compositeId = loanData.asset_id;
            if (compositeId.startsWith('asset-')) {
                linked_type = 'asset';
                linked_id = parseInt(compositeId.replace('asset-', ''));
            } else if (compositeId.startsWith('purchase-')) {
                linked_type = 'purchase';
                linked_id = parseInt(compositeId.replace('purchase-', ''));
            }
        }

        // Ensure user_id is in the data
        const payload = {
            ...loanData,
            user_id: user.user_id,
            linked_type,
            linked_id
        };
        delete payload.asset_id; // Remove old field

        try {
            let url = `${API_BASE_URL}/loans`;
            let method = "POST";

            if (editingLoan && editingLoan.loan_id) {
                url = `${API_BASE_URL}/loans/${editingLoan.loan_id}`;
                method = "PUT";
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                fetchData(); // Refresh list
                setIsDrawerOpen(false);
                setEditingLoan(null);
            } else {
                console.error("Failed to save loan");
                const err = await response.text();
                alert(`Error: ${err}`);
            }
        } catch (error) {
            console.error("Error saving loan:", error);
            alert("Error saving loan");
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loanToDelete, setLoanToDelete] = useState<LoanInformationDTO | null>(null);

    const openDeleteModal = (loan: LoanInformationDTO) => {
        setLoanToDelete(loan);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!loanToDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/loans/${loanToDelete.loan_id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchData();
            } else {
                alert("Failed to delete loan");
            }
        } catch (error) {
            console.error("Error deleting loan:", error);
        } finally {
            setIsDeleteModalOpen(false);
            setLoanToDelete(null);
        }
    };

    const openAddDrawer = () => {
        setEditingLoan(null);
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (loan: LoanInformationDTO) => {
        setEditingLoan(loan);
        setIsDrawerOpen(true);
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading loans...</div>;

    return (
        <section id="loans-page" className="min-h-screen max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Loan Manager</h2>
                    <p className="text-gray-600 mt-1">Manage your existing debt and financing.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAiModal(true)}
                        className="flex items-center gap-2 bg-green-50 text-dpa-dark-green font-semibold px-4 py-2 rounded-lg hover:bg-green-100 transition shadow-sm border border-green-200"
                    >
                        <span>✨</span> Extract via AI
                    </button>
                    <button
                        onClick={openAddDrawer}
                        className="flex items-center gap-2 bg-dpa-dark-green text-white px-4 py-2 rounded-lg hover:bg-green-800 transition shadow-sm font-medium"
                    >
                        <Plus size={20} />
                        Add New Loan
                    </button>
                </div>
            </div>

            <LoansTable
                loans={loans}
                assets={assets}
                onEdit={openEditDrawer}
                onDelete={openDeleteModal}
            />

            <LoanDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                loanToEdit={editingLoan}
                assets={assets}
                onSave={handleSaveLoan}
            />

            <AiLoanUploadModal
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
                onSave={(data) => {
                    const draftLoan: any = {
                        lender_name: data.lender_name || "",
                        loan_name: data.loan_name || "",
                        loan_amount: data.loan_amount ? Math.round(data.loan_amount) : "",
                        interest_rate: data.interest_rate || "",
                        loan_term_years: data.loan_term_years || "",
                        loan_start_date: data.loan_start_month && data.loan_start_year ? `${data.loan_start_year}-${data.loan_start_month.padStart(2, '0')}-01` : "",
                        loan_type: "Term Loan",
                        payment_frequency: "Monthly",
                        status: "Active",
                        remaining_balance: data.loan_amount ? Math.round(data.loan_amount) : "",
                        monthly_payment: "",
                    };
                    setEditingLoan(draftLoan);
                    setIsDrawerOpen(true);
                }}
            />
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && loanToDelete && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 border border-red-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Loan?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">{loanToDelete.loan_name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete Loan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default LoansPage;
