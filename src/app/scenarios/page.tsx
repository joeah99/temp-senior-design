"use client";

import AddReplacement from "@/components/add-replacement";
import ResultsTax from "@/components/results-tax";
import SelectAssets from "@/components/select-assets";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useScenario } from "@/context/ScenarioContext";

export const dynamic = "force-dynamic";

export default function Scenarios() {
  const steps = ["select-assets", "replacement-purchases", "results-tax", "actions"];

  const searchParams = useSearchParams();
  const router = useRouter();
  const { computeScenario } = useScenario();

  const currentStep = searchParams.get("step") || steps[0];
  const currentStepIndex = steps.indexOf(currentStep);

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      router.push(`?step=${steps[index]}`, { scroll: false });
    }
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= 0 && nextIndex < steps.length) {
      // if navigating to results, compute scenario first
      if (steps[nextIndex] === "results-tax") {
        computeScenario();
      }
      goToStep(nextIndex);
    }
  };
  const prevStep = () => goToStep(currentStepIndex - 1);

  return (
    <>
      <div className="flex-1 ml-64 bg-white p-8 transition-all duration-300">
        {currentStep === "select-assets" && <SelectAssets />}

        {currentStep === "replacement-purchases" && <AddReplacement />}

        {currentStep === "results-tax" && <ResultsTax />}

        {currentStep === "actions" && (
          <section id="actions">
            <h2 className="text-3xl font-bold text-black mb-8">Actions</h2>
          </section>
        )}
      </div>

      <footer className="fixed bottom-0 right-0 h-16 flex flex-row gap-2 items-center justify-between px-6">
        {currentStepIndex > 0 && (
          <button
            onClick={prevStep}
            className="flex bg-dpa-dark-green text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800 transition-colors"
          >
            <ChevronLeft />
            Back
          </button>
        )}
        {currentStepIndex < steps.length - 1 && (
          <button
            onClick={nextStep}
            className="flex bg-dpa-dark-green text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800 transition-colors"
          >
            Next
            <ChevronRight />
          </button>
        )}
      </footer>
    </>
  );
}
