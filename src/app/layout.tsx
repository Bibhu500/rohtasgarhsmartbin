import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmartDustbin | IoT Live Telemetry Dashboard",
  description:
    "Real-time ESP32 Smart Dustbin IoT monitoring system with fill level tracking, environmental sensing, and automated collection alerts.",
  keywords: ["Smart Dustbin", "IoT", "ESP32", "Waste Management", "Next.js", "MongoDB Atlas"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
