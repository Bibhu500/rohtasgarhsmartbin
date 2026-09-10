import { BinReading } from "@/types/bin";

// In-memory fallback buffer when MongoDB Atlas is not yet configured in .env.local
const mockReadings: BinReading[] = [
  {
    _id: "mock-1",
    bin_id: "BIN-001",
    fill: 72,
    moisture: 38,
    temperature: 28.4,
    tilt: "NORMAL",
    lid: "CLOSED",
    wifi: "ONLINE",
    latitude: 28.6139,
    longitude: 77.2090,
    createdAt: new Date(Date.now() - 30 * 1000).toISOString(),
  },
  {
    _id: "mock-2",
    bin_id: "BIN-001",
    fill: 68,
    moisture: 36,
    temperature: 28.1,
    tilt: "NORMAL",
    lid: "CLOSED",
    wifi: "ONLINE",
    latitude: 28.6139,
    longitude: 77.2090,
    createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
  },
  {
    _id: "mock-3",
    bin_id: "BIN-001",
    fill: 65,
    moisture: 34,
    temperature: 27.9,
    tilt: "NORMAL",
    lid: "CLOSED",
    wifi: "ONLINE",
    latitude: 28.6139,
    longitude: 77.2090,
    createdAt: new Date(Date.now() - 90 * 1000).toISOString(),
  },
  {
    _id: "mock-4",
    bin_id: "BIN-002",
    fill: 92,
    moisture: 65,
    temperature: 31.2,
    tilt: "NORMAL",
    lid: "OPEN",
    wifi: "ONLINE",
    latitude: 28.6200,
    longitude: 77.2150,
    createdAt: new Date(Date.now() - 15 * 1000).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var _mockBinReadings: BinReading[] | undefined;
}

if (!global._mockBinReadings) {
  global._mockBinReadings = mockReadings;
}

export function getMockReadings(): BinReading[] {
  return global._mockBinReadings || [];
}

export function addMockReading(reading: BinReading): BinReading {
  if (!global._mockBinReadings) {
    global._mockBinReadings = [];
  }
  global._mockBinReadings.unshift(reading);
  // Keep last 200 readings in memory
  if (global._mockBinReadings.length > 200) {
    global._mockBinReadings.pop();
  }
  return reading;
}
