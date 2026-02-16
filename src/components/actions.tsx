"use client";

import React from 'react'
import { useScenario } from '@/context/ScenarioContext';
import { exportResultsToCSV } from '@/utils/csv-utils';

const Actions = () => {
  const { computedResults } = useScenario();

  const handleDownloadCSV = () => {
    exportResultsToCSV(computedResults);
  };

  const hasResults = computedResults && Object.keys(computedResults).length > 0;

  return (
    <section id="actions" className="min-h-screen">
      <h2 className="scenario-heading">Actions</h2>

      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Export Data</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Download Results & Tax Analysis
                </p>
                <p className="text-xs text-gray-500">
                  Export all calculated results, sale details, and purchase details to a CSV file.
                </p>
              </div>

              <button
                onClick={handleDownloadCSV}
                disabled={!hasResults}
                className="bg-dpa-dark-green text-white font-semibold px-6 py-2 rounded shadow 
                  hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed 
                  transition-all duration-200 text-sm whitespace-nowrap"
                title={!hasResults ? "Calculate scenario first to enable download" : "Download CSV"}
              >
                Download CSV
              </button>
            </div>

            {!hasResults && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                ⚠️ No results available. Please navigate to "Results & Tax" and click "Calculate Scenario" first.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Actions;