"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Send, RefreshCw, X, CheckCircle, AlertCircle } from "lucide-react";
import { TiltStatus, LidStatus, WifiStatus } from "@/types/bin";

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSent: () => void;
  currentBinId: string;
  binName?: string;
}

export default function SimulatorModal({
  isOpen,
  onClose,
  onDataSent,
  currentBinId,
  binName = "Dustbin 1",
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

  useEffect(() => {
    if (currentBinId) {
      setBinId(currentBinId);
    }
  }, [currentBinId]);

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
        setTemperature(52.5);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-xl p-5 sm:p-7 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ESP32 Sensor Simulator
              </h2>
              <p className="text-xs text-slate-500">
                Transmit test sensor packet for <span className="font-semibold text-emerald-700">{binName}</span> ({binId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Quick Scenario Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPreset("normal")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 border border-slate-200 transition-colors"
            >
              Normal (25%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("full")}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 border border-rose-200 transition-colors"
            >
              Full (92% Alert)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("tiltAlert")}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-700 border border-amber-200 transition-colors"
            >
              Tilted Fall
            </button>
            <button
              type="button"
              onClick={() => applyPreset("highTemp")}
              className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-xs font-semibold text-orange-700 border border-orange-200 transition-colors"
            >
              High Heat (52°C)
            </button>
          </div>
        </div>

        {/* Form Controls */}
        <div className="mt-5 space-y-3.5">
          {/* Bin ID & Wifi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Target Bin ID
              </label>
              <input
                type="text"
                value={binId}
                onChange={(e) => setBinId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                WiFi Status
              </label>
              <select
                value={wifi}
                onChange={(e) => setWifi(e.target.value as WifiStatus)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ONLINE">ONLINE</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
          </div>

          {/* Fill Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600">Fill Level (0-100%)</span>
              <span className="font-mono font-bold text-emerald-700">{fill}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fill}
              onChange={(e) => setFill(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Moisture Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600">Moisture (0-100%)</span>
              <span className="font-mono font-bold text-sky-700">{moisture}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600">Temperature (°C)</span>
              <span className="font-mono font-bold text-amber-700">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="10"
              max="65"
              step="0.5"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Tilt & Lid Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Tilt Gyro
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTilt("NORMAL")}
                  className={`py-1.5 text-xs rounded-lg font-bold border transition-colors ${
                    tilt === "NORMAL"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  NORMAL
                </button>
                <button
                  type="button"
                  onClick={() => setTilt("TILTED")}
                  className={`py-1.5 text-xs rounded-lg font-bold border transition-colors ${
                    tilt === "TILTED"
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  TILTED
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Lid Sensor
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLid("CLOSED")}
                  className={`py-1.5 text-xs rounded-lg font-bold border transition-colors ${
                    lid === "CLOSED"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  CLOSED
                </button>
                <button
                  type="button"
                  onClick={() => setLid("OPEN")}
                  className={`py-1.5 text-xs rounded-lg font-bold border transition-colors ${
                    lid === "OPEN"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  OPEN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs ${
              result.success
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{result.message}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSend}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send Packet to API
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
