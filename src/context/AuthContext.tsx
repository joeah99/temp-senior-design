"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Types
type User = {
    user_id: number;
    full_name: string;
    email: string;
    company?: string;
    created_at?: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (full_name: string, email: string, password: string, company?: string) => Promise<void>;
    logout: () => void;
    checkSession: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = () => {
        // Simple check: see if user data is in localStorage
        // In a real app, you'd verify a token with the backend
        const storedUser = localStorage.getItem("asset_manager_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Login failed");
            }

            const userData: User = await res.json();
            setUser(userData);
            localStorage.setItem("asset_manager_user", JSON.stringify(userData));
            router.push("/scenarios"); // Redirect after login
        } catch (err) {
            // Error propagates to UI
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (full_name: string, email: string, password: string, company?: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name, email, password, company }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Signup failed");
            }

            const userData: User = await res.json();
            setUser(userData);
            localStorage.setItem("asset_manager_user", JSON.stringify(userData));
            router.push("/scenarios"); // Redirect after signup
        } catch (err) {
            // Error propagates to UI
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("asset_manager_user");
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
