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
  LogOut,
  Cpu,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { BinReading, BinApiResponse } from "@/types/bin";
import {
  ALL_100_BINS,
  generateInitial100Readings,
  getBinCategory,
  BinInfo,
} from "@/lib/binsData";
import MetricCard from "@/components/MetricCard";
import FillLevelBar from "@/components/FillLevelBar";
import MapWidget from "@/components/MapWidget";
import HistoryLog from "@/components/HistoryLog";
import SimulatorModal from "@/components/SimulatorModal";
import LoginForm from "@/components/LoginForm";
import BinsCategoryOverview from "@/components/BinsCategoryOverview";

export default function SmartDustbinApp() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("admin");

  // Active Dustbin state (Dustbin 1 active by default)
  const [activeBinId, setActiveBinId] = useState<string>("BIN-001");
  const [readingsMap, setReadingsMap] = useState<Record<string, BinReading>>(() =>
    generateInitial100Readings()
  );
  const [latestReading, setLatestReading] = useState<BinReading | null>(null);
  const [history, setHistory] = useState<BinReading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Check auth session on load
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setCurrentUser(data.user?.username || "admin");
          return;
        }
      }
      setIsAuthenticated(false);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsAuthenticated(false);
    }
  };

  // Fetch telemetry for currently selected dustbin + all 100 bins summary
  const fetchBinTelemetry = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      try {
        setError(null);
        const url = `/api/bin-data?bin_id=${encodeURIComponent(
          activeBinId
        )}&history=true&limit=50`;

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const data: BinApiResponse = await res.json();
        if (data.success) {
          if (data.latest) {
            setLatestReading(data.latest);
            setReadingsMap((prev) => ({
              ...prev,
              [data.latest!.bin_id]: data.latest!,
            }));
          }
          if (data.history) {
            setHistory(data.history);
          }
          if (data.allLatest) {
            setReadingsMap((prev) => ({
              ...prev,
              ...data.allLatest,
            }));
          }
          setCountdown(5);
        } else {
          setError(data.message || "Failed to retrieve telemetry");
        }
      } catch (err: any) {
        setError(err.message || "Network error fetching sensor data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeBinId]
  );

  // Re-fetch whenever selected tab / bin changes
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchBinTelemetry();
    }
  }, [isAuthenticated, activeBinId, fetchBinTelemetry]);

  // 5-second polling timer
  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchBinTelemetry();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, fetchBinTelemetry]);

  // Format relative timestamp
  const formatTimeAgo = (dateInput: string | Date | undefined) => {
    if (!dateInput) return "No data";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Unknown";
    const sec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (sec < 5) return "Just now";
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Auth checking loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Verifying secure session...</span>
        </div>
      </div>
    );
  }

  // If not logged in, render the clean landing / login page
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  // Active Dustbin Metadata
  const currentBin =
    ALL_100_BINS.find((b) => b.id === activeBinId) || ALL_100_BINS[0];
  const currentCategory = getBinCategory(latestReading?.fill ?? 0);

  const isHighTemp = (latestReading?.temperature ?? 0) > 45;
  const isTilted = latestReading?.tilt === "TILTED";
  const isFull = (latestReading?.fill ?? 0) > 80;
  const isLidOpen = latestReading?.lid === "OPEN";
  const isWifiOffline = latestReading?.wifi === "OFFLINE";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  SmartDustbin
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  100 Bins Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Rohtasgarh Municipal Waste &amp; IoT Telemetry Portal
              </p>
            </div>
          </div>

          {/* Right Header Actions: User, Refresh, Simulator, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 5s auto-refresh countdown indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono">
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : "text-slate-400"}`}
              />
              <span>{countdown}s</span>
            </div>

            <button
              type="button"
              onClick={() => fetchBinTelemetry(true)}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-600" : ""}`}
              />
            </button>

            {/* ESP32 Simulator trigger */}
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Packet</span>
              <span className="sm:hidden">Sim</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-colors"
              title="Sign out of dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchBinTelemetry(true)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. 100 DUSTBINS CATEGORY OVERVIEW (Full, Medium, Low, Empty) */}
        <BinsCategoryOverview
          allBins={ALL_100_BINS}
          readingsMap={readingsMap}
          selectedBinId={activeBinId}
          onSelectBin={(binId) => setActiveBinId(binId)}
        />

        {/* Active Bin Details Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900 text-sm">{currentBin.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono font-semibold">{currentBin.id}</span>
            {currentBin.isRealDevice && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                LIVE ESP32
              </span>
            )}
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Updated {formatTimeAgo(latestReading?.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${currentCategory.bgLight} ${currentCategory.badgeText} ${currentCategory.borderColor}`}
            >
              <span className={`w-2 h-2 rounded-full ${currentCategory.dotColor}`} />
              Tier: {currentCategory.category} ({currentCategory.rangeLabel})
            </span>

            {isFull || isTilted || isHighTemp || isWifiOffline ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Alert
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Normal
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && !latestReading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-36 bg-white rounded-2xl border border-slate-200" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-28 bg-white rounded-xl border border-slate-200" />
              ))}
            </div>
            <div className="h-64 bg-white rounded-2xl border border-slate-200" />
          </div>
        ) : (
          <>
            {/* 2. Hero Fill Level Bar with 4 Color-Coded Categories */}
            <FillLevelBar
              fill={latestReading?.fill ?? 0}
              binName={currentBin.name}
            />

            {/* 3. 5 IoT Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Moisture */}
              <MetricCard
                title="Moisture"
                value={latestReading?.moisture ?? 0}
                unit="%"
                subtitle={
                  (latestReading?.moisture ?? 0) > 70
                    ? "Wet organic waste"
                    : "Dry waste"
                }
                icon={Droplets}
                status={(latestReading?.moisture ?? 0) > 70 ? "warning" : "ok"}
                badgeText={(latestReading?.moisture ?? 0) > 70 ? "HUMID" : "DRY"}
              />

              {/* Temperature */}
              <MetricCard
                title="Temperature"
                value={latestReading?.temperature ?? 0}
                unit="°C"
                subtitle={
                  isHighTemp ? "High heat alert!" : "Normal ambient"
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
                  isTilted ? "Tilted / Knocked over!" : "Upright"
                }
                icon={Compass}
                status={isTilted ? "danger" : "ok"}
                badgeText={isTilted ? "TILTED" : "LEVEL"}
              />

              {/* Lid */}
              <MetricCard
                title="Lid Sensor"
                value={latestReading?.lid || "CLOSED"}
                subtitle={
                  isLidOpen ? "Lid open to air" : "Closed tightly"
                }
                icon={Layers}
                status={isLidOpen ? "warning" : "ok"}
                badgeText={isLidOpen ? "OPEN" : "SEALED"}
              />

              {/* WiFi Status */}
              <MetricCard
                title="WiFi Link"
                value={latestReading?.wifi || "ONLINE"}
                subtitle={
                  isWifiOffline ? "Signal lost" : "Connected"
                }
                icon={isWifiOffline ? WifiOff : Wifi}
                status={isWifiOffline ? "danger" : "ok"}
                badgeText={isWifiOffline ? "OFFLINE" : "LINKED"}
              />
            </div>

            {/* 4. Map & Device Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MapWidget
                  latitude={latestReading?.latitude ?? currentBin.latitude}
                  longitude={latestReading?.longitude ?? currentBin.longitude}
                  binId={currentBin.id}
                  binName={currentBin.name}
                />
              </div>

              {/* Device Quick Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Unit Details &amp; Category
                  </h3>
                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Unit Name</span>
                      <span className="font-semibold text-slate-800">{currentBin.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Hardware ID</span>
                      <span className="font-mono font-semibold text-slate-800">{currentBin.id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Category Tier</span>
                      <span className={`font-bold ${currentCategory.badgeText}`}>
                        {currentCategory.category} ({currentCategory.rangeLabel})
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Location Tag</span>
                      <span className="text-slate-800 text-right max-w-[180px] truncate">{currentBin.location}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Device Type</span>
                      <span className="font-semibold text-emerald-700">
                        {currentBin.isRealDevice ? "Physical ESP32 IoT" : "Simulated Node"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Pickup Priority</span>
                      <span
                        className={`font-bold ${
                          isFull
                            ? "text-rose-700"
                            : isTilted
                            ? "text-amber-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {isFull ? "HIGH (Full >80%)" : isTilted ? "CHECK (Tilted)" : "NORMAL"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Auto-polling: every 5s
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSimulatorOpen(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    Simulate &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Telemetry Log */}
            <HistoryLog
              history={history}
              binName={currentBin.name}
            />
          </>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SmartDustbin IoT Portal • Logged in as <strong>{currentUser}</strong></span>
          <span className="text-[11px] text-slate-400">100 Municipal Nodes • ESP32 • Next.js 14+</span>
        </div>
      </footer>

      {/* Simulator Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onDataSent={() => fetchBinTelemetry(true)}
        currentBinId={activeBinId}
        binName={currentBin.name}
      />
    </div>
  );
}
