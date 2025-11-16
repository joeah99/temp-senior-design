export type StepId =
  | "select-assets"
  | "replacement-purchases"
  | "results-tax"
  | "actions";

export const steps: { id: StepId; label: string }[] = [
  { id: "select-assets", label: "Select Assets" },
  { id: "replacement-purchases", label: "Add Replacement Purchases" },
  { id: "results-tax", label: "Results & Tax" },
  { id: "actions", label: "Actions" },
];
