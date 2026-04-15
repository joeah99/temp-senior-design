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
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  const goToStep = (stepId: string) => {
    router.push(`?step=${stepId}`, { scroll: false });
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`bg-white w-64 fixed h-screen overflow-y-auto z-50 transition-transform duration-300 lg:translate-x-0 border-r border-gray-200 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-end px-4 py-4 lg:hidden border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Steps */}
        <nav className="flex flex-col gap-0.5 px-3 py-5 flex-1">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.id;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-150 text-left
                  ${isActive
                    ? "text-dpa-dark-green bg-dpa-dark-green/8"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {/* Dot indicator */}
                <span
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    isActive ? "bg-dpa-dark-green scale-125" : "bg-gray-300"
                  }`}
                />

                <span className="leading-snug">{step.label}</span>

                {/* Left edge active bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-dpa-dark-green rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Progress footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Progress</span>
            <span className="text-xs font-semibold text-dpa-dark-green">
              {currentIndex + 1} / {steps.length}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-dpa-dark-green rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ScenariosSideBar;
