"use client";

import React, { useState } from "react";
import { Cpu, Send, RefreshCw, X, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { TiltStatus, LidStatus, WifiStatus } from "@/types/bin";

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSent: () => void;
  currentBinId: string;
}

export default function SimulatorModal({
  isOpen,
  onClose,
  onDataSent,
  currentBinId,
}: SimulatorModalProps) {
  const [binId, setBinId] = useState(currentBinId || "BIN-001");
  const [fill, setFill] = useState(78);
  const [moisture, setMoisture] = useState(45);
  const [temperature, setTemperature] = useState(32.5);
  const [tilt, setTilt] = useState<TiltStatus>("NORMAL");
  const [lid, setLid] = useState<LidStatus>("CLOSED");
  const [wifi, setWifi] = useState<WifiStatus>("ONLINE");
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const applyPreset = (type: "normal" | "full" | "tiltAlert" | "highTemp") => {
    switch (type) {
      case "normal":
        setFill(25);
        setMoisture(20);
        setTemperature(26.0);
        setTilt("NORMAL");
        setLid("CLOSED");
        setWifi("ONLINE");
        break;
      case "full":
        setFill(92);
        setMoisture(58);
        setTemperature(34.0);
        setTilt("NORMAL");
        setLid("OPEN");
        setWifi("ONLINE");
        break;
      case "tiltAlert":
        setFill(60);
        setMoisture(35);
        setTemperature(29.0);
        setTilt("TILTED");
        setLid("OPEN");
        setWifi("ONLINE");
        break;
      case "highTemp":
        setFill(85);
        setMoisture(80);
        setTemperature(52.5); // High temperature alert
        setTilt("NORMAL");
        setLid("CLOSED");
        setWifi("ONLINE");
        break;
    }
    setResult(null);
  };

  const handleSend = async () => {
    setLoading(true);
    setResult(null);

    const payload = {
      bin_id: binId,
      fill: Number(fill),
      moisture: Number(moisture),
      temperature: Number(temperature),
      tilt,
      lid,
      wifi,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    try {
      const res = await fetch("/api/bin-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: data.message || "Telemetry successfully posted to /api/bin-data!",
        });
        onDataSent();
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to post data to API",
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Network error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ESP32 Hardware Simulator
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HTTP Client
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Trigger mock sensor packets to test the <code className="text-emerald-300">POST /api/bin-data</code> endpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Simulation Scenarios
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPreset("normal")}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors text-center"
            >
              Normal (25%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("full")}
              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 border border-rose-800/50 transition-colors text-center"
            >
              Full (92% Alert)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("tiltAlert")}
              className="px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-xs font-semibold text-amber-300 border border-amber-800/50 transition-colors text-center"
            >
              Tilted Fall
            </button>
            <button
              type="button"
              onClick={() => applyPreset("highTemp")}
              className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-xs font-semibold text-purple-300 border border-purple-800/50 transition-colors text-center"
            >
              High Heat (52°C)
            </button>
          </div>
        </div>

        {/* Form Controls */}
        <div className="mt-6 space-y-4">
          {/* Bin ID & Wifi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Bin Identifier (bin_id)
              </label>
              <input
                type="text"
                value={binId}
                onChange={(e) => setBinId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                placeholder="e.g. BIN-001"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                WiFi Status
              </label>
              <select
                value={wifi}
                onChange={(e) => setWifi(e.target.value as WifiStatus)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="ONLINE">ONLINE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
          </div>

          {/* Fill Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Fill Level (0-100%)</span>
              <span className="font-mono font-bold text-emerald-400">{fill}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fill}
              onChange={(e) => setFill(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Moisture Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Moisture (0-100%)</span>
              <span className="font-mono font-bold text-cyan-400">{moisture}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Temperature (°C)</span>
              <span className="font-mono font-bold text-amber-400">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="10"
              max="65"
              step="0.5"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Tilt & Lid Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Tilt Gyroscope
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTilt("NORMAL")}
                  className={`py-2 text-xs rounded-xl font-bold transition-colors border ${
                    tilt === "NORMAL"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  NORMAL
                </button>
                <button
                  type="button"
                  onClick={() => setTilt("TILTED")}
                  className={`py-2 text-xs rounded-xl font-bold transition-colors border ${
                    tilt === "TILTED"
                      ? "bg-rose-600 text-white border-rose-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  TILTED
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Lid Proximity Sensor
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLid("CLOSED")}
                  className={`py-2 text-xs rounded-xl font-bold transition-colors border ${
                    lid === "CLOSED"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  CLOSED
                </button>
                <button
                  type="button"
                  onClick={() => setLid("OPEN")}
                  className={`py-2 text-xs rounded-xl font-bold transition-colors border ${
                    lid === "OPEN"
                      ? "bg-amber-600 text-white border-amber-500"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  OPEN
                </button>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
              result.success
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                : "bg-rose-950/40 text-rose-300 border-rose-500/40"
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{result.message}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending Packet...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Transmit Sensor Packet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
