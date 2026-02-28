import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { StoreInitializer } from "@/components/StoreInitializer";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ConflictModal } from "@/components/sync/ConflictModal";
import { Toaster } from "sonner";

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
        <html lang="en" className="dark">
            <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">
                <Providers>
                    <StoreInitializer>
                        <Header />
                        <div className="flex pt-14">
                            <Sidebar />
                            <main className="flex-1 ml-[260px] min-h-[calc(100vh-3.5rem)]">
                                {children}
                            </main>
                        </div>
                        <ConflictModal />
                        <Toaster
                            theme="dark"
                            position="bottom-right"
                            toastOptions={{
                                style: {
                                    background: "rgb(39 39 42)",
                                    border: "1px solid rgb(63 63 70)",
                                    color: "rgb(228 228 231)",
                                },
                            }}
                        />
                    </StoreInitializer>
                </Providers>
            </body>
        </html>
    );
}
