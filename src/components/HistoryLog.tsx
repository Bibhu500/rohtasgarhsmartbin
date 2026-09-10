"use client";

import React from "react";
import { BinReading } from "@/types/bin";
import { History } from "lucide-react";

interface HistoryLogProps {
  history: BinReading[];
  binName?: string;
}

export default function HistoryLog({ history, binName = "Dustbin 1" }: HistoryLogProps) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 shadow-sm">
        <p className="text-sm">No telemetry records yet for {binName}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            <History className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {binName} Recent Telemetry Log
            </h3>
            <p className="text-xs text-slate-500">Showing last {history.length} sensor packets</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Bin ID</th>
              <th className="py-2.5 px-3">Fill %</th>
              <th className="py-2.5 px-3">Moisture</th>
              <th className="py-2.5 px-3">Temp</th>
              <th className="py-2.5 px-3">Tilt</th>
              <th className="py-2.5 px-3">Lid</th>
              <th className="py-2.5 px-3">WiFi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((item, idx) => {
              const date = new Date(item.createdAt);
              const timeString = isNaN(date.getTime())
                ? "Just now"
                : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

              return (
                <tr
                  key={item._id || idx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {timeString}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {item.bin_id}
                  </td>
                  <td className="py-2 px-3 font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${
                        item.fill >= 80
                          ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                          : item.fill <= 20
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-sky-50 text-sky-700 border-sky-200"
                      }`}
                    >
                      {item.fill}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 font-mono">
                    {item.moisture}%
                  </td>
                  <td className="py-2 px-3 text-slate-600 font-mono">
                    <span className={item.temperature > 45 ? "text-rose-600 font-bold" : ""}>
                      {item.temperature}°C
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.tilt === "TILTED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {item.tilt}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.lid === "OPEN"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.lid}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
                        item.wifi === "ONLINE"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.wifi === "ONLINE" ? "bg-emerald-600" : "bg-rose-600"
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
