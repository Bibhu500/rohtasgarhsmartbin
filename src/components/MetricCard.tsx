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
  // Status color styles
  const statusStyles = {
    ok: {
      border: "border-emerald-500/30 hover:border-emerald-500/60",
      glow: "from-emerald-500/10 via-transparent to-transparent",
      iconBg: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      valueColor: "text-white",
    },
    warning: {
      border: "border-amber-500/40 hover:border-amber-500/70",
      glow: "from-amber-500/15 via-transparent to-transparent",
      iconBg: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      valueColor: "text-amber-200",
    },
    danger: {
      border: "border-rose-500/50 hover:border-rose-500/80 animate-pulse-glow",
      glow: "from-rose-500/20 via-transparent to-transparent",
      iconBg: "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      valueColor: "text-rose-200",
    },
    neutral: {
      border: "border-slate-800 hover:border-slate-700",
      glow: "from-slate-800/20 via-transparent to-transparent",
      iconBg: "bg-slate-800 text-slate-300 ring-1 ring-slate-700",
      badge: "bg-slate-800 text-slate-400 border-slate-700",
      valueColor: "text-slate-100",
    },
  };

  const style = statusStyles[status];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md p-5 border transition-all duration-300 shadow-lg hover:shadow-xl ${style.border}`}
    >
      {/* Background soft ambient gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${style.glow} pointer-events-none opacity-60`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${style.iconBg} transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10 mt-3 flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold tracking-tight ${style.valueColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-slate-400">
            {unit}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between">
        {subtitle && (
          <p className="text-xs text-slate-400 truncate max-w-[170px]">
            {subtitle}
          </p>
        )}
        {badgeText && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${style.badge}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {extra && <div className="relative z-10 mt-3">{extra}</div>}
    </div>
  );
}
