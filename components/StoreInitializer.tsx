"use client";

import { useEffect } from "react";
import { useDevVaultStore } from "@/lib/store";
import type { ReactNode } from "react";

export function StoreInitializer({ children }: { children: ReactNode }) {
    const { loadNotes } = useDevVaultStore();

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    return <>{children}</>;
}
