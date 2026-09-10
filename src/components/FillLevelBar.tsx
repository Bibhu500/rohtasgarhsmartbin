"use client";

import React from "react";
import { Trash2, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface FillLevelBarProps {
  fill: number; // 0 - 100
}

export default function FillLevelBar({ fill }: FillLevelBarProps) {
  const clampedFill = Math.min(100, Math.max(0, Math.round(fill)));

  // Determine status & badge
  let statusBadge: {
    label: "FULL" | "NORMAL" | "EMPTY";
    colorClass: string;
    barColor: string;
    icon: typeof AlertTriangle;
    description: string;
  };

  if (clampedFill >= 80) {
    statusBadge = {
      label: "FULL",
      colorClass: "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/50",
      barColor: "bg-gradient-to-r from-rose-600 via-rose-500 to-red-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]",
      icon: AlertTriangle,
      description: "Immediate waste collection required!",
    };
  } else if (clampedFill <= 20) {
    statusBadge = {
      label: "EMPTY",
      colorClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50",
      barColor: "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
      icon: CheckCircle2,
      description: "Optimal capacity available.",
    };
  } else {
    statusBadge = {
      label: "NORMAL",
      colorClass: "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-950/50",
      barColor: "bg-gradient-to-r from-cyan-600 via-sky-500 to-amber-500 shadow-[0_0_15px_rgba(14,165,233,0.4)]",
      icon: Info,
      description: "Moderate waste fill level.",
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
      {/* Dynamic ambient background glow depending on fill level */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          clampedFill >= 80 ? "bg-rose-600" : clampedFill <= 20 ? "bg-emerald-600" : "bg-sky-600"
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-3.5 rounded-2xl border transition-all duration-300 ${
              clampedFill >= 80
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                : clampedFill <= 20
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-sky-500/15 border-sky-500/30 text-sky-400"
            }`}
          >
            <Trash2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
                Live Waste Fill Level
              </h2>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{statusBadge.description}</p>
          </div>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider border shadow-md ${statusBadge.colorClass}`}
          >
            <StatusIcon className="w-4 h-4" />
            <span>{statusBadge.label}</span>
          </div>

          <div className="text-right pl-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {clampedFill}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-400 ml-1">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Main Progress Bar Container */}
      <div className="relative z-10 mt-6">
        <div className="h-5 w-full bg-slate-950/80 rounded-full overflow-hidden p-1 border border-slate-800/80 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${statusBadge.barColor}`}
            style={{ width: `${clampedFill}%` }}
          />
        </div>

        {/* Level Scale Ticks */}
        <div className="mt-2.5 flex justify-between text-[11px] font-semibold text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            0% (Empty)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            50%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            80% (Threshold)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            100% (Full)
          </span>
        </div>
      </div>

      {/* Critical Alert Banner if Full */}
      {clampedFill >= 80 && (
        <div className="relative z-10 mt-5 flex items-center gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
          <div>
            <span className="font-bold text-rose-300">Dispatch Alert:</span> This dustbin has crossed 80% capacity. Municipal sanitation crew should be scheduled for pickup.
          </div>
        </div>
      )}
    </div>
  );
}
