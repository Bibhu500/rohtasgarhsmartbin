"use client";

import React from "react";
import { BinReading } from "@/types/bin";
import { History, ArrowUpRight } from "lucide-react";

interface HistoryLogProps {
  history: BinReading[];
}

export default function HistoryLog({ history }: HistoryLogProps) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 text-center text-slate-400">
        <p className="text-sm">No historical telemetry recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Telemetry Log (Recent {history.length} Events)
            </h3>
            <p className="text-xs text-slate-400">Sorted by timestamp descending</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-80 overflow-y-auto pr-1">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] sticky top-0 backdrop-blur-md">
            <tr>
              <th className="py-2.5 px-3 rounded-l-lg">Time</th>
              <th className="py-2.5 px-3">Bin ID</th>
              <th className="py-2.5 px-3">Fill %</th>
              <th className="py-2.5 px-3">Moisture</th>
              <th className="py-2.5 px-3">Temp</th>
              <th className="py-2.5 px-3">Tilt</th>
              <th className="py-2.5 px-3">Lid</th>
              <th className="py-2.5 px-3 rounded-r-lg">WiFi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {history.map((item, idx) => {
              const date = new Date(item.createdAt);
              const timeString = isNaN(date.getTime())
                ? "Just now"
                : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

              return (
                <tr
                  key={item._id || idx}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {timeString}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {item.bin_id}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono ${
                        item.fill >= 80
                          ? "bg-rose-500/20 text-rose-300 font-bold"
                          : item.fill <= 20
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-sky-500/20 text-sky-300"
                      }`}
                    >
                      {item.fill}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono">
                    {item.moisture}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono">
                    <span className={item.temperature > 45 ? "text-rose-400 font-bold" : ""}>
                      {item.temperature}°C
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.tilt === "TILTED"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {item.tilt}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.lid === "OPEN"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.lid}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                        item.wifi === "ONLINE"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.wifi === "ONLINE" ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      {item.wifi}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
