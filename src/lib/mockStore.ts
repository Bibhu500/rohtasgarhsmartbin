import { BinReading } from "@/types/bin";
import { generateInitial100Readings, ALL_100_BINS } from "./binsData";

// In-memory fallback buffer supporting 100 Dustbins
declare global {
  // eslint-disable-next-line no-var
  var _mockBinReadings: BinReading[] | undefined;
  // eslint-disable-next-line no-var
  var _mockLatest100Map: Record<string, BinReading> | undefined;
}

if (!global._mockLatest100Map) {
  global._mockLatest100Map = generateInitial100Readings();
}

if (!global._mockBinReadings) {
  global._mockBinReadings = Object.values(global._mockLatest100Map);
}

export function getMockReadings(): BinReading[] {
  return global._mockBinReadings || [];
}

export function getLatest100Map(): Record<string, BinReading> {
  if (!global._mockLatest100Map) {
    global._mockLatest100Map = generateInitial100Readings();
  }
  return global._mockLatest100Map;
}

export function addMockReading(reading: BinReading): BinReading {
  if (!global._mockBinReadings) {
    global._mockBinReadings = [];
  }
  if (!global._mockLatest100Map) {
    global._mockLatest100Map = generateInitial100Readings();
  }

  // Update latest map for the 100 bins
  global._mockLatest100Map[reading.bin_id] = reading;

  // Add to chronological log
  global._mockBinReadings.unshift(reading);
  if (global._mockBinReadings.length > 500) {
    global._mockBinReadings.pop();
  }
  return reading;
}
