import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { StoreInitializer } from "@/components/StoreInitializer";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
    title: "DevVault",
    description: "Your developer knowledge OS — local-first, GitHub-synced",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
                <Providers>
                    <StoreInitializer>
                        <AppShell>{children}</AppShell>
                    </StoreInitializer>
                </Providers>
            </body>
        </html>
    );
}
