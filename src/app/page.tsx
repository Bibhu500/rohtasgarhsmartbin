"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  Droplets,
  Thermometer,
  Compass,
  Layers,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Database,
  Cpu,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { BinReading, BinApiResponse } from "@/types/bin";
import MetricCard from "@/components/MetricCard";
import FillLevelBar from "@/components/FillLevelBar";
import MapWidget from "@/components/MapWidget";
import HistoryLog from "@/components/HistoryLog";
import SimulatorModal from "@/components/SimulatorModal";

export default function DashboardPage() {
  const [selectedBinId, setSelectedBinId] = useState<string>("BIN-001");
  const [availableBins, setAvailableBins] = useState<string[]>(["BIN-001", "BIN-002"]);
  const [latestReading, setLatestReading] = useState<BinReading | null>(null);
  const [history, setHistory] = useState<BinReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(5);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Fetch bin data from GET /api/bin-data
  const fetchData = useCallback(
    async (isManual = false) => {
      if (isManual) {
        setRefreshing(true);
      }
      try {
        setError(null);
        const url = `/api/bin-data?bin_id=${encodeURIComponent(
          selectedBinId
        )}&history=true&limit=50`;

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const data: BinApiResponse = await res.json();

        if (data.success) {
          if (data.latest) {
            setLatestReading(data.latest);
          }
          if (data.history) {
            setHistory(data.history);
          }
          if (data.bins && data.bins.length > 0) {
            setAvailableBins((prev) => {
              const merged = Array.from(new Set([...prev, ...data.bins!]));
              return merged;
            });
          }
          setIsMockData(Boolean(data.isMockData));
          setWarningMessage(data.message || null);
          setLastFetchTime(new Date());
          setCountdown(5);
        } else {
          setError(data.message || "Failed to load telemetry data");
        }
      } catch (err: any) {
        setError(err.message || "Network error fetching bin data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedBinId]
  );

  // Initial load and on bin change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 5-second Polling interval + Countdown timer
  useEffect(() => {
    if (!isPollingActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPollingActive, fetchData]);

  // Formatter for relative or absolute timestamp
  const formatTimeAgo = (dateInput: string | Date | undefined) => {
    if (!dateInput) return "No telemetry yet";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Unknown";

    const secondsAgo = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secondsAgo < 5) return "Just now";
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Status mapping logic
  const isHighTemp = (latestReading?.temperature ?? 0) > 45;
  const isTilted = latestReading?.tilt === "TILTED";
  const isFull = (latestReading?.fill ?? 0) >= 80;
  const isLidOpen = latestReading?.lid === "OPEN";
  const isWifiOffline = latestReading?.wifi === "OFFLINE";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Live Pill */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  SmartDustbin
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ESP32 IoT Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Automated Municipal Waste & Telemetry Center
              </p>
            </div>
          </div>

          {/* Controls: Bin Selector, Polling Controls, Simulator Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bin Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedBinId}
                onChange={(e) => setSelectedBinId(e.target.value)}
                className="appearance-none bg-slate-900 hover:bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-200 pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
              >
                {availableBins.map((bin) => (
                  <option key={bin} value={bin}>
                    {bin}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {/* Polling Interval & Manual Refresh */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400">
              <button
                onClick={() => setIsPollingActive(!isPollingActive)}
                className="hover:text-white transition-colors"
                title={isPollingActive ? "Pause polling" : "Resume polling"}
              >
                {isPollingActive ? (
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>
              <span className="font-mono text-[11px] text-slate-300">
                {isPollingActive ? `${countdown}s` : "Paused"}
              </span>
            </div>

            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Telemetry Now"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`}
              />
            </button>

            {/* ESP32 Simulator Trigger */}
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Simulate ESP32</span>
              <span className="sm:hidden">Sim</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Environment / MongoDB Connection Alert if using local mock store */}
        {isMockData && (
          <div className="rounded-2xl bg-sky-950/30 border border-sky-500/30 p-4 text-xs text-sky-200 flex items-start sm:items-center justify-between gap-3 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <span className="font-bold text-sky-300">
                  Preview Mode Active:
                </span>{" "}
                Connect your real MongoDB Atlas cluster by configuring{" "}
                <code className="bg-sky-900/60 px-1.5 py-0.5 rounded font-mono text-white">
                  MONGODB_URI
                </code>{" "}
                in <code className="bg-sky-900/60 px-1.5 py-0.5 rounded font-mono text-white">.env.local</code>. Live testing and ESP32 telemetry are currently stored in fast memory.
              </div>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/40 text-[11px] font-semibold transition-colors"
            >
              Test Sensor Packet
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-2xl bg-rose-950/40 border border-rose-500/50 p-4 text-xs text-rose-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchData(true)}
              className="px-3 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-semibold text-xs transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !latestReading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 bg-slate-900/80 rounded-3xl border border-slate-800" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-900/80 rounded-2xl border border-slate-800"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-900/80 rounded-3xl border border-slate-800" />
              <div className="h-64 bg-slate-900/80 rounded-3xl border border-slate-800" />
            </div>
          </div>
        ) : (
          <>
            {/* Status Warning Pill Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-slate-200 font-semibold">Monitoring:</span>
                <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-emerald-400 font-bold">
                  {latestReading?.bin_id || selectedBinId}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Last reported:{" "}
                  <span className="text-slate-200 font-medium">
                    {formatTimeAgo(latestReading?.createdAt)}
                  </span>
                </span>
              </div>

              {/* Aggregated System Health Tag */}
              <div className="flex items-center gap-2">
                {isFull || isTilted || isHighTemp || isWifiOffline ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    <ShieldAlert className="w-4 h-4" />
                    Action Required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    All Systems Normal
                  </span>
                )}
              </div>
            </div>

            {/* 1. HERO COMPONENT: Fill Level Bar */}
            <FillLevelBar fill={latestReading?.fill ?? 0} />

            {/* 2. 5 CORE SENSOR METRIC CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Moisture */}
              <MetricCard
                title="Moisture"
                value={latestReading?.moisture ?? 0}
                unit="%"
                subtitle={
                  (latestReading?.moisture ?? 0) > 70
                    ? "Wet organic waste"
                    : "Normal dryness"
                }
                icon={Droplets}
                status={
                  (latestReading?.moisture ?? 0) > 70 ? "warning" : "ok"
                }
                badgeText={
                  (latestReading?.moisture ?? 0) > 70 ? "HUMID" : "DRY"
                }
              />

              {/* Temperature */}
              <MetricCard
                title="Temperature"
                value={latestReading?.temperature ?? 0}
                unit="°C"
                subtitle={
                  isHighTemp
                    ? "Extreme heat / Fire hazard!"
                    : "Normal ambient"
                }
                icon={Thermometer}
                status={isHighTemp ? "danger" : "ok"}
                badgeText={isHighTemp ? "HIGH TEMP" : "NORMAL"}
              />

              {/* Tilt */}
              <MetricCard
                title="Tilt Status"
                value={latestReading?.tilt || "NORMAL"}
                subtitle={
                  isTilted ? "Bin knocked over / Tilted!" : "Upright & stable"
                }
                icon={Compass}
                status={isTilted ? "danger" : "ok"}
                badgeText={isTilted ? "TILT ALERT" : "OK"}
              />

              {/* Lid */}
              <MetricCard
                title="Lid State"
                value={latestReading?.lid || "CLOSED"}
                subtitle={
                  isLidOpen ? "Lid left open to air" : "Closed & sealed"
                }
                icon={Layers}
                status={isLidOpen ? "warning" : "ok"}
                badgeText={isLidOpen ? "OPEN" : "SEALED"}
              />

              {/* WiFi Status */}
              <MetricCard
                title="ESP32 WiFi"
                value={latestReading?.wifi || "ONLINE"}
                subtitle={
                  isWifiOffline ? "Disconnected from router" : "Connected & sync"
                }
                icon={isWifiOffline ? WifiOff : Wifi}
                status={isWifiOffline ? "danger" : "ok"}
                badgeText={isWifiOffline ? "OFFLINE" : "LINKED"}
              />
            </div>

            {/* 3. MIDDLE SECTION: Map Widget & Diagnostics Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Widget (2 cols on large screen) */}
              <div className="lg:col-span-2">
                <MapWidget
                  latitude={latestReading?.latitude ?? 28.6139}
                  longitude={latestReading?.longitude ?? 77.2090}
                  binId={latestReading?.bin_id || selectedBinId}
                />
              </div>

              {/* Hardware & Collection Information Panel */}
              <div className="rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Device Diagnostics
                  </h3>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Device ID</span>
                      <span className="font-mono font-semibold text-white">
                        ESP32-{latestReading?.bin_id || selectedBinId}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Firmware Protocol</span>
                      <span className="font-mono text-emerald-400">
                        HTTP/1.1 REST JSON
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Database Storage</span>
                      <span className="font-mono text-slate-300">
                        {isMockData ? "In-Memory Buffer" : "MongoDB Atlas"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Timestamp</span>
                      <span className="font-mono text-slate-300">
                        {latestReading?.createdAt
                          ? new Date(latestReading.createdAt).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Collection Priority</span>
                      <span
                        className={`font-bold ${
                          isFull
                            ? "text-rose-400"
                            : isTilted
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {isFull
                          ? "URGENT (Full)"
                          : isTilted
                          ? "INSPECT (Tilted)"
                          : "LOW (Normal)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Live Polling: every 5s
                  </span>
                  <button
                    onClick={() => setIsSimulatorOpen(true)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    Open Simulator &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* 4. HISTORICAL READINGS LOG */}
            <HistoryLog history={history} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© SmartDustbin IoT • Real-time ESP32 Municipal Waste Monitoring</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="font-mono text-[11px]">POST /api/bin-data</span>
            <span>•</span>
            <span className="font-mono text-[11px]">GET /api/bin-data</span>
          </div>
        </div>
      </footer>

      {/* ESP32 Simulator Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onDataSent={() => fetchData(true)}
        currentBinId={selectedBinId}
      />
    </div>
  );
}
