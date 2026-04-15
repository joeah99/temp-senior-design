"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="fixed z-50 top-0 w-full h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-full flex items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/img/dpa-logo.jpg"
            alt="logo"
            width={85}
            height={34}
            style={{ height: "auto" }}
            priority
          />
        </Link>

        {/* Right side */}
        {user && (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 shadow-sm"
            >
              <span className="w-7 h-7 rounded-full bg-dpa-dark-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0 uppercase">
                {user.full_name?.charAt(0) ?? "?"}
              </span>
              <span className="hidden sm:block max-w-[140px] truncate">{user.full_name}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{user.full_name}</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
