// CSV Export Utility for Results & Tax Data

const formatMethodName = (method: string) => {
    switch (method) {
        case "BONUS":
            return "Bonus Depreciation";
        case "SECTION_179":
            return "§179 Expensing";
        case "MACRS_GDS":
            return "MACRS GDS";
        case "MACRS_ADS":
            return "MACRS ADS";
        case "AUTO":
            return "Auto-Max";
        default:
            return method?.replace(/_/g, " ") || "-";
    }
};

const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const escapeCSV = (value: any): string => {
    const str = String(value ?? "");
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export const exportResultsToCSV = (computedResults: any) => {
    if (!computedResults) {
        alert("No results available to export. Please calculate the scenario first.");
        return;
    }

    const lines: string[] = [];

    // Header
    lines.push("Results & Tax Analysis CSV Export");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Tax Year: ${computedResults.taxYear || "N/A"}`);
    lines.push("");

    // Summary Section
    lines.push("=== SUMMARY ===");
    lines.push("");

    lines.push("Liquidation (Sales)");
    lines.push("Category,Amount");
    lines.push(`Total Sale Proceeds,$${formatCurrency(computedResults.totalSaleProceeds || 0)}`);
    lines.push(`Transaction Fees,$${formatCurrency(computedResults.totalTransactionFees || 0)}`);
    lines.push(`§1245 Recapture (Ordinary),$${formatCurrency(computedResults.totalSection1245Recapture || 0)}`);
    lines.push(`§1231 Gain (Capital),$${formatCurrency(computedResults.totalSection1231Gain || 0)}`);
    lines.push(`Est. Tax on Sales,$${formatCurrency(computedResults.totalTaxOnSales || 0)}`);
    lines.push(`Net Cash from Sales,$${formatCurrency(computedResults.netCashFromLiquidation || 0)}`);
    lines.push("");

    lines.push("Replacements (Purchases)");
    lines.push("Category,Amount");
    lines.push(`Total Replacement Cost,$${formatCurrency(computedResults.totalReplacementCost || 0)}`);
    lines.push(`Bonus Depreciation,$${formatCurrency(computedResults.totalBonusDepreciation || 0)}`);
    lines.push(`§179 Deduction,$${formatCurrency(computedResults.totalSection179 || 0)}`);
    lines.push(`MACRS (Year 1),$${formatCurrency(computedResults.totalMacrsFirstYear || 0)}`);
    lines.push(`Total First-Year Write-off,$${formatCurrency(computedResults.totalFirstYearDeductions || 0)}`);
    lines.push(`Est. Tax Savings,$${formatCurrency(computedResults.taxSavingsFromDeductions || 0)}`);
    lines.push("");

    lines.push("Net Cash Flow Analysis");
    lines.push("Category,Amount");
    lines.push(`Cash In (Sales),$${formatCurrency(computedResults.netCashFromLiquidation || 0)}`);
    lines.push(`Cash Out (Purchases),-$${formatCurrency(computedResults.cashRequiredForReplacements || 0)}`);
    lines.push(`Tax Savings (In),+$${formatCurrency(computedResults.taxSavingsFromDeductions || 0)}`);
    lines.push(`NET CASH IMPACT,$${formatCurrency(computedResults.netCashFlow || 0)}`);
    lines.push("");
    lines.push("");

    // Sale Details Section
    lines.push("=== SALE DETAILS ===");
    lines.push("");
    if (computedResults.saleDetails && computedResults.saleDetails.length > 0) {
        lines.push("Asset Name,Sale Price,Adjusted Basis,Total Gain,§1245 Recapture,§1231 Gain,Tax on Sale,Net Proceeds After Tax");
        computedResults.saleDetails.forEach((sale: any) => {
            lines.push(
                [
                    escapeCSV(sale.assetName),
                    `$${formatCurrency(sale.salePrice || 0)}`,
                    `$${formatCurrency(sale.adjustedBasis || 0)}`,
                    `$${formatCurrency(sale.totalGain || 0)}`,
                    `$${formatCurrency(sale.section1245Recapture || 0)}`,
                    `$${formatCurrency(sale.section1231Gain || 0)}`,
                    `$${formatCurrency(sale.taxOnSale || 0)}`,
                    `$${formatCurrency(sale.netProceedsAfterTax || 0)}`,
                ].join(",")
            );
        });
    } else {
        lines.push("No assets sold.");
    }
    lines.push("");
    lines.push("");

    // Replacement Details Section
    lines.push("=== PURCHASE DETAILS ===");
    lines.push("");
    if (computedResults.replacementDetails && computedResults.replacementDetails.length > 0) {
        lines.push("Asset Name,Cost,Depreciation Method,Depreciable Basis,Bonus Depreciation,§179 Deduction,MACRS (Year 1),Total Year 1 Deduction,Tax Savings");
        computedResults.replacementDetails.forEach((repl: any) => {
            lines.push(
                [
                    escapeCSV(repl.assetName),
                    `$${formatCurrency(repl.cost || 0)}`,
                    escapeCSV(formatMethodName(repl.methodUsed)),
                    `$${formatCurrency(repl.depreciableBasis || 0)}`,
                    `$${formatCurrency(repl.bonusDepreciation || 0)}`,
                    `$${formatCurrency(repl.section179 || 0)}`,
                    `$${formatCurrency(repl.macrsFirstYear || 0)}`,
                    `$${formatCurrency(repl.totalFirstYearDeduction || 0)}`,
                    `$${formatCurrency(repl.taxSavings || 0)}`,
                ].join(",")
            );
        });
    } else {
        lines.push("No assets purchased.");
    }
    lines.push("");

    // Warnings Section
    if (computedResults.warnings && computedResults.warnings.length > 0) {
        lines.push("");
        lines.push("=== WARNINGS ===");
        lines.push("");
        computedResults.warnings.forEach((warning: string) => {
            lines.push(escapeCSV(warning));
        });
    }

    // Create CSV content
    const csvContent = lines.join("\n");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `results-tax-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
