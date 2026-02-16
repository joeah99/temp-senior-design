import { render, screen } from "@testing-library/react";
import AssetsCard from "../assets-card";

// Mock the context
jest.mock("@/context/ScenarioContext", () => ({
    useScenario: jest.fn(),
}));

import { useScenario } from "@/context/ScenarioContext";

const mockAsset = {
    id: 1,
    category: "Vehicle",
    asset: "Test Car",
    year: "2022",
    fair_market_value: 20000,
    book_value: 15000,
};

describe("AssetsCard State Parsing", () => {
    it("correctly parses closeMonth into month and year fields", () => {
        // Setup the mock to return a specific state
        (useScenario as jest.Mock).mockReturnValue({
            saleDetails: {
                1: {
                    salePrice: 10000,
                    fees: 500,
                    closeMonth: "2026-11", // YYYY-MM
                },
            },
            updateSaleDetails: jest.fn(),
        });

        render(<AssetsCard asset={mockAsset} onRemove={jest.fn()} />);

        // Check Month Select (value should be "11")
        const monthSelect = screen.getByRole("combobox") as HTMLSelectElement;
        expect(monthSelect.value).toBe("11");

        // Check Year Input (value should be "2026")
        const yearInput = screen.getByPlaceholderText("YYYY") as HTMLInputElement;
        expect(yearInput.value).toBe("2026");
    });

    it("handles empty closeMonth correctly", () => {
        (useScenario as jest.Mock).mockReturnValue({
            saleDetails: {},
            updateSaleDetails: jest.fn(),
        });

        render(<AssetsCard asset={mockAsset} onRemove={jest.fn()} />);

        const monthSelect = screen.getByRole("combobox") as HTMLSelectElement;
        expect(monthSelect.value).toBe("");

        const yearInput = screen.getByPlaceholderText("YYYY") as HTMLInputElement;
        expect(yearInput.value).toBe("");
    });
});
