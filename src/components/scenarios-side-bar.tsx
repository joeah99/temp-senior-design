"use client";

import ScenariosSteps from "./scenarios-steps";
import { steps } from "@/utils/steps";
import { useSearchParams, useRouter } from "next/navigation";

const ScenariosSideBar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentStep = searchParams.get("step") || "select-assets";

  const goToStep = (stepId: string) => {
    router.push(`?step=${stepId}`, { scroll: false });
  };

  return (
    <div className="bg-white p-6 w-75 fixed h-screen overflow-y-auto">
      <div className="flex flex-row relative">
        <div className="absolute h-full w-[3px] bg-dpa-light-gray"></div>

        <div className="flex flex-col gap-2">
          {steps.map((step) => (
            <ScenariosSteps
              key={step.id}
              section={step.label}
              isActive={currentStep === step.id}
              onClick={() => goToStep(step.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenariosSideBar;
