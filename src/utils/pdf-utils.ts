// PDF Audit Pack Generator — DPA Asset Manager
// Uses jsPDF (client-side only) for zero-backend PDF generation.
// Dynamic import prevents SSR issues.

const formatMoney = (value: number): string =>
    "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatMethodName = (method: string): string => {
    switch (method) {
        case "BONUS": return "Bonus Depreciation (§168(k))";
        case "SECTION_179": return "§179 Expensing";
        case "MACRS_GDS": return "MACRS GDS";
        case "MACRS_ADS": return "MACRS ADS";
        case "AUTO": return "Auto-Max";
        default: return method?.replace(/_/g, " ") || "-";
    }
};

// ────────────────────────────────────────────────────────────────────────────
// Core PDF builder
// ────────────────────────────────────────────────────────────────────────────

export const exportResultsToPDF = async (computedResults: any): Promise<void> => {
    if (!computedResults) {
        alert("No results available. Please run Calculate Scenario first.");
        return;
    }

    // Dynamic import so jspdf is never bundled into the server chunk
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });

    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const MARGIN_L = 50;
    const MARGIN_R = PAGE_W - 50;
    const COL_W = PAGE_W - MARGIN_L * 2;

    const taxYear = computedResults.taxYear ?? new Date().getFullYear();
    const generatedAt = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

    // Color palette
    const GREEN_DARK = "#1a5c3a";   // DPA brand dark green
    const GREEN_LIGHT = "#e8f5ee";
    const SLATE_BG = "#f8fafc";
    const BORDER_CLR = "#e2e8f0";
    const TEXT_DARK = "#1e293b";
    const TEXT_MID = "#64748b";
    const TEXT_LIGHT = "#94a3b8";
    const WARNING_BG = "#fefce8";
    const WARNING_CLR = "#92400e";

    let y = MARGIN_L; // current Y cursor

    // ── Helpers ───────────────────────────────────────────────────────────────

    const hexToRgb = (hex: string): [number, number, number] => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    };

    const setFill = (hex: string) => doc.setFillColor(...hexToRgb(hex));
    const setDraw = (hex: string) => doc.setDrawColor(...hexToRgb(hex));
    const setTxt = (hex: string) => doc.setTextColor(...hexToRgb(hex));

    const checkPage = (needed = 60): void => {
        if (y + needed > PAGE_H - 50) {
            doc.addPage();
            y = 50;
        }
    };

    const hLine = (lw = 0.5): void => {
        setDraw(BORDER_CLR);
        doc.setLineWidth(lw);
        doc.line(MARGIN_L, y, MARGIN_R, y);
    };

    // Section heading with green background bar
    const sectionHeader = (title: string): void => {
        checkPage(36);
        setFill(GREEN_DARK);
        doc.rect(MARGIN_L, y, COL_W, 22, "F");
        setTxt("#ffffff");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(title.toUpperCase(), MARGIN_L + 10, y + 14.5);
        y += 28;
    };

    // Two-column key / value row with alternating stripe
    let rowIndex = 0;
    const kvRow = (label: string, value: string, highlight = false): void => {
        checkPage(20);
        const isEven = rowIndex % 2 === 0;
        if (isEven) {
            setFill(SLATE_BG);
            doc.rect(MARGIN_L, y, COL_W, 18, "F");
        }
        if (highlight) {
            setFill(GREEN_LIGHT);
            doc.rect(MARGIN_L, y, COL_W, 18, "F");
        }
        setTxt(highlight ? GREEN_DARK : TEXT_DARK);
        doc.setFont("helvetica", highlight ? "bold" : "normal");
        doc.setFontSize(8.5);
        doc.text(label, MARGIN_L + 8, y + 12);
        doc.setFont("helvetica", highlight ? "bold" : "normal");
        doc.text(value, MARGIN_R - 8, y + 12, { align: "right" });
        y += 18;
        rowIndex++;
    };

    const resetRowIndex = (): void => { rowIndex = 0; };

    // Table with header + rows
    const table = (
        headers: string[],
        rows: string[][],
        colWidths: number[],
    ): void => {
        const totalW = colWidths.reduce((a, b) => a + b, 0);
        const scale = COL_W / totalW;
        const scaledW = colWidths.map(w => w * scale);
        const rowH = 18;

        const drawRow = (cells: string[], rowY: number, isHeader: boolean, stripe: boolean): void => {
            checkPage(rowH);
            if (isHeader) {
                setFill(GREEN_DARK);
                doc.rect(MARGIN_L, rowY, COL_W, rowH, "F");
                setTxt("#ffffff");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(7.5);
            } else {
                if (stripe) { setFill(SLATE_BG); doc.rect(MARGIN_L, rowY, COL_W, rowH, "F"); }
                setTxt(TEXT_DARK);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.5);
            }

            let cx = MARGIN_L;
            cells.forEach((cell, i) => {
                const isNumeric = i > 0; // first col is label/name, rest are numbers
                doc.text(
                    cell,
                    isNumeric ? cx + scaledW[i] - 4 : cx + 4,
                    rowY + 12,
                    { align: isNumeric ? "right" : "left" }
                );
                cx += scaledW[i];
            });
        };

        drawRow(headers, y, true, false);
        y += rowH;
        rows.forEach((r, i) => {
            drawRow(r, y, false, i % 2 === 0);
            y += rowH;
        });
        y += 6;
    };

    // ── PAGE 1: Header ────────────────────────────────────────────────────────

    // Big green header band
    setFill(GREEN_DARK);
    doc.rect(0, 0, PAGE_W, 90, "F");

    setTxt("#ffffff");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("DPA Asset Manager", MARGIN_L, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Tax Scenario Audit Pack", MARGIN_L, 56);

    doc.setFontSize(9);
    setTxt("#a7f3d0");
    doc.text(`Tax Year ${taxYear}  •  Generated ${generatedAt}`, MARGIN_L, 72);

    setTxt(TEXT_LIGHT);
    doc.setFontSize(7);
    doc.text("For informational purposes only. Consult a qualified tax advisor.", MARGIN_L, 84);

    y = 110;

    // ── Liquidation Summary ───────────────────────────────────────────────────
    sectionHeader("Liquidation Summary (Asset Sales)");
    resetRowIndex();
    kvRow("Total Sale Proceeds", formatMoney(computedResults.totalSaleProceeds ?? 0));
    kvRow("Transaction Fees", formatMoney(computedResults.totalTransactionFees ?? 0));
    kvRow("§1245 Recapture (Ordinary Income)", formatMoney(computedResults.totalSection1245Recapture ?? 0));
    kvRow("§1231 Gain (Long-Term Capital)", formatMoney(computedResults.totalSection1231Gain ?? 0));
    kvRow("Estimated Tax on Sales", formatMoney(computedResults.totalTaxOnSales ?? 0));
    kvRow("NET CASH FROM LIQUIDATION", formatMoney(computedResults.netCashFromLiquidation ?? 0), true);
    y += 12;

    // ── Replacement Summary ───────────────────────────────────────────────────
    sectionHeader("Replacement Summary (Asset Purchases)");
    resetRowIndex();
    kvRow("Total Replacement Cost", formatMoney(computedResults.totalReplacementCost ?? 0));
    kvRow("Bonus Depreciation §168(k)", formatMoney(computedResults.totalBonusDepreciation ?? 0));
    kvRow("§179 Deduction", formatMoney(computedResults.totalSection179 ?? 0));
    kvRow("MACRS Year 1", formatMoney(computedResults.totalMacrsFirstYear ?? 0));
    kvRow("Total First-Year Write-Off", formatMoney(computedResults.totalFirstYearDeductions ?? 0), true);
    kvRow("Estimated Tax Savings", formatMoney(computedResults.taxSavingsFromDeductions ?? 0), true);
    y += 12;

    // ── Net Cash Flow ─────────────────────────────────────────────────────────
    sectionHeader("Net Cash Flow Analysis");
    resetRowIndex();
    kvRow("Cash In — Net from Sales", formatMoney(computedResults.netCashFromLiquidation ?? 0));
    kvRow("Cash Out — Replacement Purchases", formatMoney(-(computedResults.cashRequiredForReplacements ?? 0)));
    kvRow("Tax Savings (Credit)", formatMoney(computedResults.taxSavingsFromDeductions ?? 0));
    if ((computedResults.totalAnnualDebtService ?? 0) > 0) {
        kvRow("Annual Debt Service (Existing Loans)", formatMoney(-(computedResults.totalAnnualDebtService ?? 0)));
    }
    kvRow("NET CASH IMPACT", formatMoney(computedResults.netCashFlow ?? 0), true);
    y += 16;

    // ── Sale Details Table ────────────────────────────────────────────────────
    checkPage(60);
    sectionHeader("Sale Details");
    if (computedResults.saleDetails?.length > 0) {
        table(
            ["Asset Name", "Sale Price", "Adj. Basis", "Total Gain", "§1245", "§1231", "Tax", "Net Proceeds"],
            computedResults.saleDetails.map((s: any) => [
                s.assetName,
                formatMoney(s.salePrice ?? 0),
                formatMoney(s.adjustedBasis ?? 0),
                formatMoney(s.totalGain ?? 0),
                formatMoney(s.section1245Recapture ?? 0),
                formatMoney(s.section1231Gain ?? 0),
                formatMoney(s.taxOnSale ?? 0),
                formatMoney(s.netProceedsAfterTax ?? 0),
            ]),
            [140, 72, 72, 72, 60, 60, 60, 80],
        );
    } else {
        setTxt(TEXT_MID);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.text("No assets sold in this scenario.", MARGIN_L + 8, y + 12);
        y += 24;
    }
    y += 4;

    // ── Purchase Details Table ────────────────────────────────────────────────
    checkPage(60);
    sectionHeader("Purchase Details");
    if (computedResults.replacementDetails?.length > 0) {
        table(
            ["Asset Name", "Cost", "Method", "Dep. Basis", "Bonus", "§179", "MACRS Yr1", "Yr1 Deduction", "Tax Savings"],
            computedResults.replacementDetails.map((r: any) => [
                r.assetName,
                formatMoney(r.cost ?? 0),
                formatMethodName(r.methodUsed),
                formatMoney(r.depreciableBasis ?? 0),
                formatMoney(r.bonusDepreciation ?? 0),
                formatMoney(r.section179 ?? 0),
                formatMoney(r.macrsFirstYear ?? 0),
                formatMoney(r.totalFirstYearDeduction ?? 0),
                formatMoney(r.taxSavings ?? 0),
            ]),
            [110, 60, 85, 60, 55, 55, 60, 75, 65],
        );
    } else {
        setTxt(TEXT_MID);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.text("No replacement assets in this scenario.", MARGIN_L + 8, y + 12);
        y += 24;
    }
    y += 4;

    // ── Warnings ──────────────────────────────────────────────────────────────
    if (computedResults.warnings?.length > 0) {
        checkPage(50);
        sectionHeader("Warnings & Flags");
        setFill(WARNING_BG);
        doc.rect(MARGIN_L, y, COL_W, computedResults.warnings.length * 18 + 12, "F");
        setDraw(WARNING_CLR);
        doc.setLineWidth(0.5);
        doc.rect(MARGIN_L, y, COL_W, computedResults.warnings.length * 18 + 12, "S");
        setTxt(WARNING_CLR);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        y += 10;
        for (const w of computedResults.warnings) {
            // Use plain ASCII - jsPDF's built-in helvetica doesn't render emoji
            const safeText = "[!] " + String(w).replace(/[^\x00-\x7F]/g, "");
            doc.text(safeText, MARGIN_L + 8, y + 8);
            y += 18;
        }
        y += 10;
    }

    // ── Statute References ────────────────────────────────────────────────────
    checkPage(100);
    sectionHeader("Statute References");
    table(
        ["Code Section", "Description"],
        [
            ["IRC §179", "First-year expensing election (up to annual limit)"],
            ["IRC §168(k)", "Bonus (additional first-year) depreciation"],
            ["IRC §168", "MACRS — Modified Accelerated Cost Recovery System"],
            ["IRC §1245", "Recapture of depreciation as ordinary income on personal property"],
            ["IRC §1231", "Treatment of gains/losses on depreciable business property held >1 year"],
        ],
        [90, 460],
    );

    // ── Footer on each page ───────────────────────────────────────────────────
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        setFill(GREEN_DARK);
        doc.rect(0, PAGE_H - 28, PAGE_W, 28, "F");
        setTxt("#a7f3d0");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(
            `DPA Asset Manager  •  Tax Year ${taxYear}  •  Confidential  •  Page ${p} of ${totalPages}`,
            PAGE_W / 2, PAGE_H - 12, { align: "center" }
        );
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    const filename = `dpa-audit-pack-${taxYear}-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
};
