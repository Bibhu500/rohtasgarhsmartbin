"use client";

import React from "react";
import { Trash2, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface FillLevelBarProps {
  fill: number; // 0 - 100
  binName?: string;
}

export default function FillLevelBar({ fill, binName = "Dustbin 1" }: FillLevelBarProps) {
  const clampedFill = Math.min(100, Math.max(0, Math.round(fill)));

  // Status mapping
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
      colorClass: "bg-rose-50 text-rose-700 border-rose-200",
      barColor: "bg-rose-600",
      icon: AlertTriangle,
      description: "Immediate waste collection required",
    };
  } else if (clampedFill <= 20) {
    statusBadge = {
      label: "EMPTY",
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      barColor: "bg-emerald-500",
      icon: CheckCircle2,
      description: "Optimal capacity available",
    };
  } else {
    statusBadge = {
      label: "NORMAL",
      colorClass: "bg-sky-50 text-sky-700 border-sky-200",
      barColor: "bg-sky-600",
      icon: Info,
      description: "Moderate waste fill level",
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border ${
              clampedFill >= 80
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : clampedFill <= 20
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-sky-50 border-sky-200 text-sky-600"
            }`}
          >
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {binName} Fill Level
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-600">
                Live Sensor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{statusBadge.description}</p>
          </div>
        </div>

        {/* Badge and Percentage */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.colorClass}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusBadge.label}</span>
          </div>

          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {clampedFill}
            </span>
            <span className="text-lg font-semibold text-slate-400 ml-0.5">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${statusBadge.barColor}`}
            style={{ width: `${clampedFill}%` }}
          />
        </div>

        {/* Level Scale */}
        <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400 px-0.5">
          <span>0% (Empty)</span>
          <span>50%</span>
          <span>80% (Alert)</span>
          <span>100% (Full)</span>
        </div>
      </div>

      {/* Critical Alert Banner if Full */}
      {clampedFill >= 80 && (
        <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">Sanitation Alert:</span> Bin is at {clampedFill}% capacity. Please schedule municipal waste collection.
          </div>
        </div>
      )}
    </div>
  );
}
