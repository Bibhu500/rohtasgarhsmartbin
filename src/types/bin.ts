export type TiltStatus = "NORMAL" | "TILTED";
export type LidStatus = "OPEN" | "CLOSED";
export type WifiStatus = "ONLINE" | "OFFLINE";

export interface BinReading {
  _id?: string;
  bin_id: string;
  fill: number; // 0 - 100
  moisture: number; // 0 - 100
  temperature: number; // in Celsius
  tilt: TiltStatus;
  lid: LidStatus;
  wifi: WifiStatus;
  latitude: number;
  longitude: number;
  createdAt: string | Date;
}

export interface BinApiResponse {
  success: boolean;
  message?: string;
  latest?: BinReading | null;
  history?: BinReading[];
  bins?: string[];
  totalReadings?: number;
  isMockData?: boolean;
}
