import React, { Suspense } from "react";
import ScenariosSideBar from "../../components/scenarios-side-bar";
import { ScenarioProvider } from "@/context/ScenarioContext";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ScenarioProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Suspense fallback={<div>Loading...</div>}>
          <ScenariosSideBar />
        </Suspense>
        <section className="flex flex-col pl-5 min-h-screen">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </section>
      </div>
    </ScenarioProvider>
  );
};

export default layout;
