"use client";

import React, { useState, useMemo } from "react";
import { BinInfo, FillCategory, getBinCategory } from "@/lib/binsData";
import { BinReading } from "@/types/bin";
import { Search, ChevronDown, ChevronUp, Layers, CheckCircle2 } from "lucide-react";

interface BinsCategoryOverviewProps {
  allBins: BinInfo[];
  readingsMap: Record<string, BinReading>;
  selectedBinId: string;
  onSelectBin: (binId: string) => void;
}

export default function BinsCategoryOverview({
  allBins,
  readingsMap,
  selectedBinId,
  onSelectBin,
}: BinsCategoryOverviewProps) {
  // Active selected category filter (null = show all or collapsed)
  const [selectedCategory, setSelectedCategory] = useState<FillCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridExpanded, setIsGridExpanded] = useState(true);

  // Group bins into 4 categories based on current readings
  const categorized = useMemo(() => {
    const counts = {
      Full: [] as { bin: BinInfo; fill: number; reading: BinReading }[],
      Medium: [] as { bin: BinInfo; fill: number; reading: BinReading }[],
      Low: [] as { bin: BinInfo; fill: number; reading: BinReading }[],
      Empty: [] as { bin: BinInfo; fill: number; reading: BinReading }[],
    };

    allBins.forEach((bin) => {
      const reading = readingsMap[bin.id] || {
        bin_id: bin.id,
        fill: 0,
        moisture: 20,
        temperature: 26,
        tilt: "NORMAL",
        lid: "CLOSED",
        wifi: "ONLINE",
        latitude: bin.latitude,
        longitude: bin.longitude,
        createdAt: new Date().toISOString(),
      };

      const catInfo = getBinCategory(reading.fill);
      counts[catInfo.category].push({
        bin,
        fill: reading.fill,
        reading,
      });
    });

    return counts;
  }, [allBins, readingsMap]);

  // Filtered list of bins based on category and search query
  const displayedBins = useMemo(() => {
    let list: { bin: BinInfo; fill: number; reading: BinReading }[] = [];

    if (selectedCategory === "ALL") {
      list = [
        ...categorized.Full,
        ...categorized.Medium,
        ...categorized.Low,
        ...categorized.Empty,
      ].sort((a, b) => a.bin.binNumber - b.bin.binNumber);
    } else {
      list = categorized[selectedCategory];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.bin.name.toLowerCase().includes(query) ||
          item.bin.id.toLowerCase().includes(query) ||
          String(item.bin.binNumber) === query ||
          item.bin.location.toLowerCase().includes(query)
      );
    }

    return list;
  }, [categorized, selectedCategory, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              100 Municipal Dustbins Overview
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              100 Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Classified across 4 live fill tiers. Click any category card to list its bins.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Bin # (e.g. 1, 45, Gate)..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4 Interactive Category Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* FULL */}
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(selectedCategory === "Full" ? "ALL" : "Full");
            setIsGridExpanded(true);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === "Full"
              ? "bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-sm"
              : "bg-white hover:bg-rose-50/50 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              Full
            </span>
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
              &gt;80–100%
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {categorized.Full.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Bins</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Immediate pickup needed</p>
        </button>

        {/* MEDIUM */}
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(selectedCategory === "Medium" ? "ALL" : "Medium");
            setIsGridExpanded(true);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === "Medium"
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-sm"
              : "bg-white hover:bg-amber-50/50 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Medium
            </span>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              &gt;30–80%
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {categorized.Medium.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Bins</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Normal accumulation</p>
        </button>

        {/* LOW */}
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(selectedCategory === "Low" ? "ALL" : "Low");
            setIsGridExpanded(true);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === "Low"
              ? "bg-sky-50 border-sky-400 ring-2 ring-sky-200 shadow-sm"
              : "bg-white hover:bg-sky-50/50 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Low
            </span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
              &gt;10–30%
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {categorized.Low.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Bins</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ample space left</p>
        </button>

        {/* EMPTY */}
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(selectedCategory === "Empty" ? "ALL" : "Empty");
            setIsGridExpanded(true);
          }}
          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === "Empty"
              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-sm"
              : "bg-white hover:bg-emerald-50/50 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Empty
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              0–10%
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {categorized.Empty.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Bins</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Clean &amp; ready</p>
        </button>
      </div>

      {/* Category Bin Selector & List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {selectedCategory === "ALL"
                ? `Showing All 100 Dustbins`
                : `${selectedCategory} Bins (${displayedBins.length} Units)`}
            </span>
            {selectedCategory !== "ALL" && (
              <button
                onClick={() => setSelectedCategory("ALL")}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
              >
                (Reset filter)
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsGridExpanded(!isGridExpanded)}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
          >
            {isGridExpanded ? (
              <>
                <span>Collapse</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Expand Bins</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {isGridExpanded && (
          <div className="max-h-64 overflow-y-auto pr-1 border border-slate-200/80 rounded-xl p-2 bg-slate-50/50">
            {displayedBins.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No dustbins match your filter or search query.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {displayedBins.map(({ bin, fill }) => {
                  const isSelected = selectedBinId === bin.id;
                  const cat = getBinCategory(fill);

                  return (
                    <button
                      key={bin.id}
                      type="button"
                      onClick={() => onSelectBin(bin.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white hover:bg-slate-100/80 text-slate-800 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs flex items-center gap-1">
                          #{bin.binNumber}
                          {bin.isRealDevice && (
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-black ${
                                isSelected ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              LIVE ESP32
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : `${cat.bgLight} ${cat.badgeText} border ${cat.borderColor}`
                          }`}
                        >
                          {fill}%
                        </span>
                      </div>

                      <div className="w-full">
                        <span
                          className={`text-[11px] font-medium truncate block ${
                            isSelected ? "text-emerald-100" : "text-slate-500"
                          }`}
                        >
                          {bin.location}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
