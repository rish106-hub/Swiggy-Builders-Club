import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import type { Viewport } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plus-One — Swiggy Household Orchestrator",
  description:
    "Plan complete occasions across Swiggy Food, Instamart & Dineout from one conversation. Three agents, one plan, instantly.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#FC8019",
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
