"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between py-4 px-8 bg-white shadow-sm shadow-zinc-200 fixed z-50 top-0 w-full h-20">
      <nav className="">
        <Link href="/">
          <Image src="/img/dpa-logo.jpg" alt="logo" height={0} width={95} />
        </Link>
      </nav>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden md:block">
            {user.full_name}
          </span>
          <button
            onClick={logout}
            className="text-sm font-medium text-gray-600 hover:text-dpa-dark-green transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};
export default NavBar;
