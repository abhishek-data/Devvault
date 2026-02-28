"use client";

import { useEffect } from "react";
import { useDevVaultStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ConflictModal } from "@/components/sync/ConflictModal";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
    const { sidebarCollapsed, theme } = useDevVaultStore();

    // Apply theme class to <html> element
    useEffect(() => {
        const html = document.documentElement;
        if (theme === "dark") {
            html.classList.add("dark");
            html.classList.remove("light");
        } else {
            html.classList.remove("dark");
            html.classList.add("light");
        }
    }, [theme]);

    return (
        <>
            <Header />
            <div className="flex pt-14">
                <Sidebar />
                <main
                    className={cn(
                        "flex-1 min-h-[calc(100vh-3.5rem)] transition-all duration-200",
                        sidebarCollapsed ? "ml-0" : "ml-[260px]"
                    )}
                >
                    {children}
                </main>
            </div>
            <ConflictModal />
            <Toaster
                theme={theme}
                position="bottom-right"
                toastOptions={{
                    style:
                        theme === "dark"
                            ? {
                                background: "rgb(39 39 42)",
                                border: "1px solid rgb(63 63 70)",
                                color: "rgb(228 228 231)",
                            }
                            : {},
                }}
            />
        </>
    );
}
