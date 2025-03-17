import type React from "react";
// import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";
import { Inter, Geist } from "next/font/google";
// import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/provider";

const inter = Inter({ subsets: ["latin"] });
const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "Log Viewer",
  description: "Query AI logs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${geist.className}`}>
        <Providers>
          <main className="min-h-screen bg-background">{children}</main>
          {/* <Toaster /> */}
        </Providers>
      </body>
    </html>
  );
}
