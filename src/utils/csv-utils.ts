// CSV Export Utility for DPA Audit Pack
// Produces a banker-ready, audit-compliant CSV.
// Numbers are exported as plain numerics (no $ prefix) so Excel auto-formats and auto-sizes correctly.

const formatMethodName = (method: string): string => {
    switch (method) {
        case "BONUS": return "Bonus Depreciation (IRC 168k)";
        case "SECTION_179": return "Section 179 Expensing";
        case "MACRS_GDS": return "MACRS GDS";
        case "MACRS_ADS": return "MACRS ADS";
        case "AUTO": return "Auto-Max (179 + Bonus + MACRS)";
        default: return method?.replace(/_/g, " ") || "-";
    }
};

// Raw numeric string — no $ sign so Excel treats as a number and auto-resizes columns
const num = (value: number): string =>
    value.toFixed(2);

const escapeCSV = (value: unknown): string => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const row = (...cells: unknown[]): string => cells.map(escapeCSV).join(",");

const sectionHeader = (label: string): string => `--- ${label} ---`;

export const exportResultsToCSV = (computedResults: any): void => {
    if (!computedResults) {
        alert("No results available. Please run Calculate Scenario first.");
        return;
    }

    const taxYear: number = computedResults.taxYear ?? new Date().getFullYear();
    const generatedAt: string = new Date().toLocaleString("en-US", {
        dateStyle: "long",
        timeStyle: "short",
    });

    const lines: string[] = [];

    // ── DOCUMENT HEADER ────────────────────────────────────────────────────────
    lines.push("DPA Asset Manager - Tax Scenario Audit Pack");
    lines.push(row("Tax Year", taxYear));
    lines.push(row("Generated", generatedAt));
    lines.push(row("Document Type", "Banker-Ready CSV Export"));
    lines.push(row("Disclaimer", "For informational purposes only. Consult a qualified tax advisor."));
    lines.push(row("Note", "All amounts in USD"));
    lines.push("");

    // ── LIQUIDATION SUMMARY ────────────────────────────────────────────────────
    lines.push(sectionHeader("Liquidation Summary (Asset Sales)"));
    lines.push(row("Line Item", "Amount (USD)"));
    lines.push(row("Total Sale Proceeds", num(computedResults.totalSaleProceeds ?? 0)));
    lines.push(row("Transaction Fees", num(computedResults.totalTransactionFees ?? 0)));
    lines.push(row("IRC 1245 Recapture (Ordinary Income)", num(computedResults.totalSection1245Recapture ?? 0)));
    lines.push(row("IRC 1231 Gain (Long-Term Capital)", num(computedResults.totalSection1231Gain ?? 0)));
    lines.push(row("Estimated Tax on Sales", num(computedResults.totalTaxOnSales ?? 0)));
    lines.push(row("NET CASH FROM LIQUIDATION", num(computedResults.netCashFromLiquidation ?? 0)));
    lines.push("");

    // ── REPLACEMENT SUMMARY ────────────────────────────────────────────────────
    lines.push(sectionHeader("Replacement Summary (Asset Purchases)"));
    lines.push(row("Line Item", "Amount (USD)"));
    lines.push(row("Total Replacement Cost", num(computedResults.totalReplacementCost ?? 0)));
    lines.push(row("Bonus Depreciation (IRC 168k)", num(computedResults.totalBonusDepreciation ?? 0)));
    lines.push(row("Section 179 Deduction", num(computedResults.totalSection179 ?? 0)));
    lines.push(row("MACRS Year 1 Deduction", num(computedResults.totalMacrsFirstYear ?? 0)));
    lines.push(row("Total First-Year Write-Off", num(computedResults.totalFirstYearDeductions ?? 0)));
    lines.push(row("Estimated Tax Savings", num(computedResults.taxSavingsFromDeductions ?? 0)));
    lines.push("");

    // ── NET CASH FLOW ──────────────────────────────────────────────────────────
    lines.push(sectionHeader("Net Cash Flow Analysis"));
    lines.push(row("Line Item", "Amount (USD)"));
    lines.push(row("Cash In - Net from Sales", num(computedResults.netCashFromLiquidation ?? 0)));
    lines.push(row("Cash Out - Replacement Purchases", num(-(computedResults.cashRequiredForReplacements ?? 0))));
    lines.push(row("Tax Savings (Credit)", num(computedResults.taxSavingsFromDeductions ?? 0)));

    if ((computedResults.totalAnnualDebtService ?? 0) > 0) {
        lines.push(row("Annual Debt Service (Existing Loans)", num(-(computedResults.totalAnnualDebtService ?? 0))));
    }

    lines.push(row("NET CASH IMPACT", num(computedResults.netCashFlow ?? 0)));
    lines.push("");

    // ── LOAN / DEBT SERVICE ────────────────────────────────────────────────────
    if ((computedResults.totalAnnualDebtService ?? 0) > 0) {
        lines.push(sectionHeader("Loan and Debt Service"));
        lines.push(row("Line Item", "Amount (USD)"));
        lines.push(row("Total Annual Debt Service (All Active Loans)", num(computedResults.totalAnnualDebtService ?? 0)));
        lines.push("");
    }

    // ── SALE DETAILS ───────────────────────────────────────────────────────────
    lines.push(sectionHeader("Sale Details"));
    if (computedResults.saleDetails?.length > 0) {
        lines.push(row(
            "Asset Name",
            "Sale Price (USD)",
            "Adjusted Basis (USD)",
            "Total Gain (USD)",
            "IRC 1245 Recapture (USD)",
            "IRC 1231 Gain (USD)",
            "Tax on Sale (USD)",
            "Net Proceeds After Tax (USD)"
        ));
        for (const sale of computedResults.saleDetails) {
            lines.push(row(
                sale.assetName,
                num(sale.salePrice ?? 0),
                num(sale.adjustedBasis ?? 0),
                num(sale.totalGain ?? 0),
                num(sale.section1245Recapture ?? 0),
                num(sale.section1231Gain ?? 0),
                num(sale.taxOnSale ?? 0),
                num(sale.netProceedsAfterTax ?? 0),
            ));
        }
    } else {
        lines.push("No assets sold in this scenario.");
    }
    lines.push("");

    // ── PURCHASE DETAILS ──────────────────────────────────────────────────────
    lines.push(sectionHeader("Purchase Details"));
    if (computedResults.replacementDetails?.length > 0) {
        lines.push(row(
            "Asset Name",
            "Cost (USD)",
            "Depreciation Method",
            "Depreciable Basis (USD)",
            "Bonus Depreciation (USD)",
            "Section 179 Deduction (USD)",
            "MACRS Year 1 (USD)",
            "Total Year 1 Deduction (USD)",
            "Tax Savings (USD)"
        ));
        for (const repl of computedResults.replacementDetails) {
            lines.push(row(
                repl.assetName,
                num(repl.cost ?? 0),
                formatMethodName(repl.methodUsed),
                num(repl.depreciableBasis ?? 0),
                num(repl.bonusDepreciation ?? 0),
                num(repl.section179 ?? 0),
                num(repl.macrsFirstYear ?? 0),
                num(repl.totalFirstYearDeduction ?? 0),
                num(repl.taxSavings ?? 0),
            ));
        }
    } else {
        lines.push("No replacement assets in this scenario.");
    }
    lines.push("");

    // ── WARNINGS ──────────────────────────────────────────────────────────────
    if (computedResults.warnings?.length > 0) {
        lines.push(sectionHeader("Warnings and Flags"));
        for (const warning of computedResults.warnings) {
            lines.push(row("WARNING: " + warning));
        }
        lines.push("");
    }

    // ── STATUTE REFERENCES ────────────────────────────────────────────────────
    lines.push(sectionHeader("Statute References"));
    lines.push(row("Code Section", "Description"));
    lines.push(row("IRC Section 179", "First-year expensing election (up to annual limit)"));
    lines.push(row("IRC Section 168(k)", "Bonus (additional first-year) depreciation"));
    lines.push(row("IRC Section 168", "MACRS - Modified Accelerated Cost Recovery System"));
    lines.push(row("IRC Section 1245", "Recapture of depreciation as ordinary income on personal property"));
    lines.push(row("IRC Section 1231", "Treatment of gains/losses on depreciable property held more than 1 year"));

    // ── TRIGGER DOWNLOAD ──────────────────────────────────────────────────────
    const csvContent = lines.join("\n");
    // No BOM — plain UTF-8 so Excel opens numbers as numbers, not text
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `dpa-audit-${taxYear}-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
