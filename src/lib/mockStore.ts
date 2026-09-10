import { BinReading } from "@/types/bin";

// In-memory fallback buffer supporting Dustbin 1, 2, 3, 4
const initialMockReadings: BinReading[] = [
  // Dustbin 1 (BIN-001) - Active Project Default
  {
    _id: "mock-1-1",
    bin_id: "BIN-001",
    fill: 42,
    moisture: 35,
    temperature: 27.5,
    tilt: "NORMAL",
    lid: "CLOSED",
    wifi: "ONLINE",
    latitude: 28.6139,
    longitude: 77.2090,
    createdAt: new Date(Date.now() - 10 * 1000).toISOString(),
  },
  {
    _id: "mock-1-2",
    bin_id: "BIN-001",
    fill: 38,
    moisture: 32,
    temperature: 27.2,
    tilt: "NORMAL",
    lid: "CLOSED",
    wifi: "ONLINE",
    latitude: 28.6139,
    longitude: 77.2090,
    createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
  },
  // Dustbin 2 (BIN-002)
  {
    _id: "mock-2-1",
    bin_id: "BIN-002",
    fill: 85,
    moisture: 68,
    temperature: 31.0,
    tilt: "NORMAL",
    lid: "OPEN",
    wifi: "ONLINE",
    latitude: 28.6200,
    longitude: 77.2150,
    createdAt: new Date(Date.now() - 25 * 1000).toISOString(),
  },
  // Dustbin 3 (BIN-003)
  {
    _id: "mock-3-1",
    bin_id: "BIN-003",
    fill: 15,
    moisture: 18,
    temperature: 25.4,
    tilt: "NORMAL",
    lid: "CLOSED",
    wifi: "ONLINE",
    latitude: 28.6105,
    longitude: 77.2025,
    createdAt: new Date(Date.now() - 40 * 1000).toISOString(),
  },
  // Dustbin 4 (BIN-004)
  {
    _id: "mock-4-1",
    bin_id: "BIN-004",
    fill: 64,
    moisture: 45,
    temperature: 28.8,
    tilt: "NORMAL",
    lid: "CLOSED",
    wifi: "ONLINE",
    latitude: 28.6280,
    longitude: 77.2210,
    createdAt: new Date(Date.now() - 50 * 1000).toISOString(),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var _mockBinReadings: BinReading[] | undefined;
}

if (!global._mockBinReadings) {
  global._mockBinReadings = initialMockReadings;
}

export function getMockReadings(): BinReading[] {
  return global._mockBinReadings || [];
}

export function addMockReading(reading: BinReading): BinReading {
  if (!global._mockBinReadings) {
    global._mockBinReadings = [];
  }
  global._mockBinReadings.unshift(reading);
  if (global._mockBinReadings.length > 200) {
    global._mockBinReadings.pop();
  }
  return reading;
}
