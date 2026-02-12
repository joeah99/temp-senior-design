"use client";

import React, { Suspense, useState } from "react";
import ScenariosSideBar from "../../components/scenarios-side-bar";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { Menu } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ScenarioProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b py-3 px-4 flex items-center sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-lg text-gray-700"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-lg">Scenarios</span>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ScenariosSideBar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </Suspense>

        <section className="flex flex-col min-h-screen lg:ml-64 transition-all duration-300">
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </section>
      </div>
    </ScenarioProvider>
  );
};
export default Layout;
