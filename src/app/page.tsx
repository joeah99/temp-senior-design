"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking connection...");
  const [backendType, setBackendType] = useState<string>("");

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;

    // Test root endpoint first
    fetch(`${api}/`)
      .then(res => res.json())
      .then(data => {
        console.log("Backend connected!", data);
        setBackendType(data.message || "Backend connected");
        setBackendStatus("✓ Connected to backend");

        // Test valuation endpoint with a test user_id
        return fetch(`${api}/Valuation/total-fmv?user_id=1`);
      })
      .then(res => res.json())
      .then(data => {
        console.log("Valuation endpoint response:", data);
      })
      .catch(err => {
        console.error("Error:", err);
        setBackendStatus("✗ Failed to connect to backend");
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Asset Manager</h1>
      <p className="text-lg text-gray-600 mb-2">{backendStatus}</p>
      <p className="text-sm text-gray-500">{backendType}</p>
      <div className="mt-8">
        <a
          href="/scenarios"
          className="bg-dpa-dark-green text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition-colors"
        >
          Go to Scenarios
        </a>
      </div>
    </div>
  );
}
