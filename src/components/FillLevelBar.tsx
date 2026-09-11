"use client";

import React from "react";
import { Trash2, AlertTriangle, CheckCircle2, Info, ArrowDownCircle } from "lucide-react";
import { getBinCategory } from "@/lib/binsData";

interface FillLevelBarProps {
  fill: number; // 0 - 100
  binName?: string;
}

export default function FillLevelBar({ fill, binName = "Dustbin 1" }: FillLevelBarProps) {
  const clampedFill = Math.min(100, Math.max(0, Math.round(fill)));
  const categoryInfo = getBinCategory(clampedFill);

  // Status mapping matching user's exact specification
  let statusIcon = CheckCircle2;
  let description = "Optimal capacity available";

  if (categoryInfo.category === "Full") {
    statusIcon = AlertTriangle;
    description = "Immediate municipal pickup required (>80%)";
  } else if (categoryInfo.category === "Medium") {
    statusIcon = Info;
    description = "Normal waste accumulation (>30–80%)";
  } else if (categoryInfo.category === "Low") {
    statusIcon = ArrowDownCircle;
    description = "Low waste level (>10–30%)";
  } else {
    // Empty
    statusIcon = CheckCircle2;
    description = "Dustbin is clean and ready (0–10%)";
  }

  const StatusIcon = statusIcon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border ${categoryInfo.bgLight} ${categoryInfo.borderColor} ${categoryInfo.badgeText}`}
          >
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {binName} Fill Level
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-600">
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Badge and Percentage */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryInfo.bgLight} ${categoryInfo.badgeText} ${categoryInfo.borderColor}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>
              {categoryInfo.category} ({categoryInfo.rangeLabel})
            </span>
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
            className={`h-full rounded-full transition-all duration-500 ease-out ${categoryInfo.barColor}`}
            style={{ width: `${clampedFill}%` }}
          />
        </div>

        {/* Level Scale with 4 exact thresholds */}
        <div className="mt-2.5 grid grid-cols-4 text-center text-[10px] sm:text-[11px] font-semibold text-slate-500 px-0.5">
          <span className="text-emerald-700 flex items-center justify-start gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Empty (0–10%)
          </span>
          <span className="text-sky-700 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            Low (&gt;10–30%)
          </span>
          <span className="text-amber-700 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Medium (&gt;30–80%)
          </span>
          <span className="text-rose-700 flex items-center justify-end gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            Full (&gt;80–100%)
          </span>
        </div>
      </div>

      {/* Critical Alert Banner if Full */}
      {clampedFill > 80 && (
        <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">Sanitation Alert:</span> Bin is at {clampedFill}% capacity (Full category &gt;80%). Please dispatch collection truck.
          </div>
        </div>
      )}
    </div>
  );
}
