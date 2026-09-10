"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  status: "ok" | "warning" | "danger" | "neutral";
  badgeText?: string;
  extra?: React.ReactNode;
}

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  status,
  badgeText,
  extra,
}: MetricCardProps) {
  // Clean, standard light theme status styles
  const statusStyles = {
    ok: {
      border: "border-slate-200 hover:border-emerald-300",
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      valueColor: "text-slate-900",
    },
    warning: {
      border: "border-amber-200 hover:border-amber-300",
      iconBg: "bg-amber-50 text-amber-700 border-amber-200",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      valueColor: "text-amber-900",
    },
    danger: {
      border: "border-rose-300 hover:border-rose-400 ring-1 ring-rose-200",
      iconBg: "bg-rose-50 text-rose-700 border-rose-200",
      badge: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
      valueColor: "text-rose-900",
    },
    neutral: {
      border: "border-slate-200 hover:border-slate-300",
      iconBg: "bg-slate-100 text-slate-600 border-slate-200",
      badge: "bg-slate-100 text-slate-600 border-slate-200",
      valueColor: "text-slate-900",
    },
  };

  const style = statusStyles[status];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 border transition-all duration-200 shadow-sm hover:shadow ${style.border}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${style.iconBg} transition-transform`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${style.valueColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-slate-500">
            {unit}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-1">
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-500 truncate max-w-[150px]">
            {subtitle}
          </p>
        )}
        {badgeText && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide border ${style.badge}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {extra && <div className="mt-2.5">{extra}</div>}
    </div>
  );
}
