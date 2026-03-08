import type { Metadata } from "next";
import { StoreInitializer } from "@/components/StoreInitializer";
import { AppShell } from "@/components/AppShell";
import { ProtectedAppFrame } from "@/components/ProtectedAppFrame";

export const metadata: Metadata = {
  title: "DevVault",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedAppFrame>
      <StoreInitializer>
        <AppShell>{children}</AppShell>
      </StoreInitializer>
    </ProtectedAppFrame>
  );
}
