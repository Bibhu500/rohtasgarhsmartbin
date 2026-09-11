import { BinReading } from "@/types/bin";

export interface BinInfo {
  id: string;
  binNumber: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  isRealDevice?: boolean;
}

export type FillCategory = "Empty" | "Low" | "Medium" | "Full";

export interface CategoryInfo {
  category: FillCategory;
  rangeLabel: string;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  bgLight: string;
  barColor: string;
  dotColor: string;
}

/**
 * Determine bin category based on user's exact specification:
 * - 0–10%   : Empty   (Green)
 * - >10–30% : Low     (Blue)
 * - >30–80% : Medium  (Yellow)
 * - >80–100%: Full    (Red)
 */
export function getBinCategory(fill: number): CategoryInfo {
  const clamped = Math.min(100, Math.max(0, Math.round(fill)));

  if (clamped <= 10) {
    return {
      category: "Empty",
      rangeLabel: "0–10%",
      colorName: "Green",
      badgeBg: "bg-emerald-500",
      badgeText: "text-emerald-700",
      borderColor: "border-emerald-300",
      bgLight: "bg-emerald-50",
      barColor: "bg-emerald-500",
      dotColor: "bg-emerald-500",
    };
  }
  if (clamped <= 30) {
    return {
      category: "Low",
      rangeLabel: ">10–30%",
      colorName: "Blue",
      badgeBg: "bg-sky-500",
      badgeText: "text-sky-700",
      borderColor: "border-sky-300",
      bgLight: "bg-sky-50",
      barColor: "bg-sky-500",
      dotColor: "bg-sky-500",
    };
  }
  if (clamped <= 80) {
    return {
      category: "Medium",
      rangeLabel: ">30–80%",
      colorName: "Yellow",
      badgeBg: "bg-amber-400",
      badgeText: "text-amber-800",
      borderColor: "border-amber-300",
      bgLight: "bg-amber-50",
      barColor: "bg-amber-400",
      dotColor: "bg-amber-400",
    };
  }
  return {
    category: "Full",
    rangeLabel: ">80–100%",
    colorName: "Red",
    badgeBg: "bg-rose-600",
    badgeText: "text-rose-700",
    borderColor: "border-rose-300",
    bgLight: "bg-rose-50",
    barColor: "bg-rose-600",
    dotColor: "bg-rose-600",
  };
}

const LOCATIONS = [
  "Rohtasgarh Main Gate",
  "Central Cafeteria",
  "Academic Block A",
  "Academic Block B",
  "Library Complex",
  "Science Laboratories",
  "Sports Ground Pavilion",
  "Auditorium Plaza",
  "Girls Hostel Quad",
  "Boys Hostel Mess",
  "Administrative Block",
  "Medical Dispensary",
  "Main Bus Terminal",
  "North Car Parking",
  "South Bicycle Stand",
  "Guest House Lawns",
  "Workshop Facility",
  "Solar Power Plant Area",
  "Canteen Walkway",
  "Security Checkpost 1",
  "Security Checkpost 2",
  "Substation Corner",
  "Botanical Garden",
  "Innovation Incubation Hub",
  "Conference Center",
];

/**
 * Generate metadata for 100 bins.
 * Dustbin 1 (BIN-001) is the live project device.
 */
export const ALL_100_BINS: BinInfo[] = Array.from({ length: 100 }, (_, i) => {
  const binNumber = i + 1;
  const padNumber = String(binNumber).padStart(3, "0");
  const id = `BIN-${padNumber}`;
  const location =
    binNumber === 1
      ? "Rohtasgarh Main Gate (Live ESP32)"
      : LOCATIONS[i % LOCATIONS.length] + ` - Station ${Math.floor(i / LOCATIONS.length) + 1}`;

  // Base coordinates around 25.3176, 82.9739
  const latOffset = ((i * 7) % 50 - 25) * 0.0012;
  const lngOffset = ((i * 11) % 50 - 25) * 0.0014;

  return {
    id,
    binNumber,
    name: `Dustbin ${binNumber}`,
    location,
    latitude: Number((25.3176 + latOffset).toFixed(6)),
    longitude: Number((82.9739 + lngOffset).toFixed(6)),
    isRealDevice: binNumber === 1,
  };
});

/**
 * Generate simulated initial readings for the other 99 bins
 * distributed predictably across the 4 categories:
 * - Empty (0–10%)
 * - Low (>10–30%)
 * - Medium (>30–80%)
 * - Full (>80–100%)
 */
export function generateInitial100Readings(): Record<string, BinReading> {
  const readingsMap: Record<string, BinReading> = {};

  // Dustbin 1 default (will be replaced by real ESP32 readings via POST)
  readingsMap["BIN-001"] = {
    _id: "init-bin-001",
    bin_id: "BIN-001",
    fill: 45,
    moisture: 32,
    temperature: 28.5,
    tilt: "NORMAL",
    lid: "CLOSED",
    wifi: "ONLINE",
    latitude: 25.3176,
    longitude: 82.9739,
    createdAt: new Date().toISOString(),
  };

  for (let i = 2; i <= 100; i++) {
    const padNumber = String(i).padStart(3, "0");
    const id = `BIN-${padNumber}`;
    const bin = ALL_100_BINS[i - 1];

    // Distribute fills across the 4 categories:
    // Every 4th bin: Full (>80-100%)
    // Every 4th+1 bin: Empty (0-10%)
    // Every 4th+2 bin: Low (>10-30%)
    // Every 4th+3 bin: Medium (>30-80%)
    let fill = 50;
    const mod = i % 4;
    if (mod === 0) {
      // Full: 81 to 98%
      fill = 81 + (i * 3) % 18;
    } else if (mod === 1) {
      // Empty: 2 to 10%
      fill = 2 + (i * 2) % 9;
    } else if (mod === 2) {
      // Low: 12 to 30%
      fill = 12 + (i * 4) % 19;
    } else {
      // Medium: 35 to 78%
      fill = 35 + (i * 5) % 44;
    }

    const isFull = fill > 80;
    readingsMap[id] = {
      _id: `init-bin-${id}`,
      bin_id: id,
      fill,
      moisture: isFull ? 55 + (i % 30) : 20 + (i % 25),
      temperature: Number((26.0 + (i % 8) * 0.8).toFixed(1)),
      tilt: i === 42 ? "TILTED" : "NORMAL",
      lid: isFull && i % 3 === 0 ? "OPEN" : "CLOSED",
      wifi: i % 19 === 0 ? "OFFLINE" : "ONLINE",
      latitude: bin.latitude,
      longitude: bin.longitude,
      createdAt: new Date(Date.now() - (i * 37000)).toISOString(),
    };
  }

  return readingsMap;
}
