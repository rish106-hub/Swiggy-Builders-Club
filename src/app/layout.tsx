import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plus-One — Swiggy Household Orchestrator",
  description:
    "Plan and execute high-stakes family occasions across Swiggy Food, Instamart & Dineout from one conversation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
