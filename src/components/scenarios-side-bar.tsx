import ScenariosSteps from "./scenarios-steps";
import { steps } from "@/utils/steps";
import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";

interface ScenariosSideBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const ScenariosSideBar = ({ isOpen = false, onClose }: ScenariosSideBarProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentStep = searchParams.get("step") || "select-assets";

  const goToStep = (stepId: string) => {
    router.push(`?step=${stepId}`, { scroll: false });
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`bg-white p-6 w-64 fixed h-screen overflow-y-auto z-50 transition-transform duration-300 lg:translate-x-0 border-r border-gray-200 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-row relative h-full">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2 lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>

          <div className="absolute h-full w-[3px] bg-dpa-light-gray left-0"></div>

          <div className="flex flex-col gap-2 w-full mt-8 lg:mt-0">
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
    </>
  );
};

export default ScenariosSideBar;
