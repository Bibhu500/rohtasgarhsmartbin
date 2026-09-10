import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmartDustbin | IoT Live Telemetry Portal",
  description:
    "Real-time ESP32 Smart Dustbin IoT monitoring system with fill level tracking, environmental sensing, and automated municipal collection alerts.",
  keywords: ["Smart Dustbin", "IoT", "ESP32", "Waste Management", "Next.js", "MongoDB Atlas"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
