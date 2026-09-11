import { NextRequest, NextResponse } from "next/server";
import {
  getBinReadingsCollection,
  isMongoConfigured,
} from "@/lib/mongodb";
import {
  getMockReadings,
  addMockReading,
  getLatest100Map,
} from "@/lib/mockStore";
import { ALL_100_BINS } from "@/lib/binsData";
import { BinReading, TiltStatus, LidStatus, WifiStatus } from "@/types/bin";

/**
 * Extensible API Key verification hook.
 * To enable authentication, set BIN_API_KEY in .env and check it here.
 */
function verifyApiKey(request: NextRequest): { valid: boolean; error?: string } {
  const expectedKey = process.env.BIN_API_KEY;
  if (!expectedKey) {
    // Auth is disabled by default for ESP32 simplicity
    return { valid: true };
  }

  const clientKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (clientKey !== expectedKey) {
    return { valid: false, error: "Unauthorized: Invalid or missing API key" };
  }

  return { valid: true };
}

/**
 * Validate and sanitize sensor payload from ESP32 or client.
 * Simple & tolerant: coerces numbers, falls back cleanly, normalizes enums.
 */
function parseAndValidatePayload(body: any): {
  valid: boolean;
  error?: string;
  reading?: Omit<BinReading, "_id">;
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON payload" };
  }

  // 1. bin_id (Required string)
  const bin_id = typeof body.bin_id === "string" ? body.bin_id.trim() : String(body.bin_id || "").trim();
  if (!bin_id) {
    return { valid: false, error: "Field 'bin_id' is required and must be a non-empty string (e.g. 'AKR-BIN-001')" };
  }

  // 2. fill (Required number: 0 - 100)
  if (body.fill === undefined || body.fill === null || typeof body.fill !== "number" || isNaN(body.fill) || body.fill < 0 || body.fill > 100) {
    return { valid: false, error: "Field 'fill' must be a valid number between 0 and 100" };
  }
  const fill = Math.round(body.fill * 10) / 10;

  // 3. moisture (Required number: 0 - 100)
  if (body.moisture === undefined || body.moisture === null || typeof body.moisture !== "number" || isNaN(body.moisture) || body.moisture < 0 || body.moisture > 100) {
    return { valid: false, error: "Field 'moisture' must be a valid number between 0 and 100" };
  }
  const moisture = Math.round(body.moisture * 10) / 10;

  // 4. temperature (Required number)
  if (body.temperature === undefined || body.temperature === null || typeof body.temperature !== "number" || isNaN(body.temperature)) {
    return { valid: false, error: "Field 'temperature' must be a valid number in Celsius" };
  }
  const temperature = Math.round(body.temperature * 10) / 10;

  // 5. tilt (Strict enum: "NORMAL" | "TILTED")
  const rawTilt = String(body.tilt || "").trim().toUpperCase();
  if (rawTilt !== "NORMAL" && rawTilt !== "TILTED") {
    return { valid: false, error: "Field 'tilt' must be strictly 'NORMAL' or 'TILTED'" };
  }
  const tilt = rawTilt as TiltStatus;

  // 6. lid (Strict enum: "OPEN" | "CLOSED")
  const rawLid = String(body.lid || "").trim().toUpperCase();
  if (rawLid !== "OPEN" && rawLid !== "CLOSED") {
    return { valid: false, error: "Field 'lid' must be strictly 'OPEN' or 'CLOSED'" };
  }
  const lid = rawLid as LidStatus;

  // 7. wifi (Strict enum: "ONLINE" | "OFFLINE")
  const rawWifi = String(body.wifi || "").trim().toUpperCase();
  if (rawWifi !== "ONLINE" && rawWifi !== "OFFLINE") {
    return { valid: false, error: "Field 'wifi' must be strictly 'ONLINE' or 'OFFLINE'" };
  }
  const wifi = rawWifi as WifiStatus;

  // 8. latitude & longitude (Numbers)
  let latitude = Number(body.latitude);
  if (isNaN(latitude)) latitude = 28.6139;

  let longitude = Number(body.longitude);
  if (isNaN(longitude)) longitude = 77.2090;

  // 9. createdAt: auto-set to current server timestamp
  const createdAt = new Date();

  return {
    valid: true,
    reading: {
      bin_id,
      fill,
      moisture,
      temperature,
      tilt,
      lid,
      wifi,
      latitude,
      longitude,
      createdAt,
    },
  };
}

/**
 * POST /api/bin-data
 * Ingests ESP32 sensor telemetry and saves to MongoDB Atlas collection "bin_readings".
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Optional API key check
    const auth = verifyApiKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    // 2. Parse request JSON body
    let rawBody: any;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON body" },
        { status: 400 }
      );
    }

    // 3. Validate & sanitize
    const validation = parseAndValidatePayload(rawBody);
    if (!validation.valid || !validation.reading) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const newReading = validation.reading;

    // 4. Save to MongoDB Atlas if configured, otherwise fallback to in-memory store
    if (isMongoConfigured()) {
      try {
        const collection = await getBinReadingsCollection();
        const result = await collection.insertOne({
          ...newReading,
        } as any);

        const savedDoc: BinReading = {
          _id: result.insertedId.toString(),
          ...newReading,
          createdAt: newReading.createdAt instanceof Date 
            ? newReading.createdAt.toISOString() 
            : newReading.createdAt,
        };

        return NextResponse.json(
          {
            success: true,
            message: "Reading successfully saved to MongoDB Atlas",
            data: savedDoc,
          },
          { status: 200 }
        );
      } catch (dbError: any) {
        console.error("MongoDB Atlas insert error:", dbError);
        // If DB fails (e.g. invalid URI or timeout), save to mock store and inform user
        const savedMock = addMockReading({
          _id: `fallback-${Date.now()}`,
          ...newReading,
          createdAt: newReading.createdAt instanceof Date 
            ? newReading.createdAt.toISOString() 
            : newReading.createdAt,
        });

        return NextResponse.json(
          {
            success: true,
            warning: "MongoDB Atlas connection failed; reading stored in fallback memory. " + dbError.message,
            data: savedMock,
            isMockData: true,
          },
          { status: 200 }
        );
      }
    } else {
      // Development mode without MONGODB_URI yet configured
      const savedMock = addMockReading({
        _id: `mem-${Date.now()}`,
        ...newReading,
        createdAt: newReading.createdAt instanceof Date 
          ? newReading.createdAt.toISOString() 
          : newReading.createdAt,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Saved to local memory (Add MONGODB_URI in .env for MongoDB Atlas persistence)",
          data: savedMock,
          isMockData: true,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in POST /api/bin-data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bin-data
 * Returns the latest reading and optionally last 50 readings for history,
 * sorted by createdAt descending.
 * Query parameters:
 *  - bin_id: string (optional, defaults to first found bin or all)
 *  - history: "true" | "false" (optional, default true)
 *  - limit: number (optional, default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const binIdParam = searchParams.get("bin_id")?.trim() || "";
    const includeHistory = searchParams.get("history") !== "false";
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const limit = isNaN(limitParam) ? 50 : Math.min(100, Math.max(1, limitParam));

    if (isMongoConfigured()) {
      try {
        const collection = await getBinReadingsCollection();

        // Find available bin_ids, ensuring all 100 bins are listed
        const distinctBins = await collection.distinct("bin_id");
        const default100Bins = ALL_100_BINS.map((b) => b.id);
        const combinedBins = Array.from(
          new Set([...default100Bins, ...(Array.isArray(distinctBins) ? distinctBins.map(String) : [])])
        );
        const binsList = combinedBins;

        // Query filter
        const targetBinId = binIdParam || (binsList[0] ?? "BIN-001");
        const query = targetBinId ? { bin_id: targetBinId } : {};

        // Fetch latest reading
        const latestDoc = await collection.findOne(query, {
          sort: { createdAt: -1 },
        });

        // Fetch history if requested
        let historyDocs: BinReading[] = [];
        if (includeHistory) {
          const rawHistory = await collection
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

          historyDocs = rawHistory.map((doc: any) => ({
            _id: doc._id?.toString(),
            bin_id: doc.bin_id,
            fill: doc.fill,
            moisture: doc.moisture,
            temperature: doc.temperature,
            tilt: doc.tilt,
            lid: doc.lid,
            wifi: doc.wifi,
            latitude: doc.latitude,
            longitude: doc.longitude,
            createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
          }));
        }

        const formattedLatest: BinReading | null = latestDoc
          ? {
              _id: latestDoc._id?.toString(),
              bin_id: latestDoc.bin_id,
              fill: latestDoc.fill,
              moisture: latestDoc.moisture,
              temperature: latestDoc.temperature,
              tilt: latestDoc.tilt,
              lid: latestDoc.lid,
              wifi: latestDoc.wifi,
              latitude: latestDoc.latitude,
              longitude: latestDoc.longitude,
              createdAt:
                latestDoc.createdAt instanceof Date
                  ? latestDoc.createdAt.toISOString()
                  : latestDoc.createdAt,
            }
          : null;

        return NextResponse.json({
          success: true,
          latest: formattedLatest,
          history: historyDocs,
          bins: binsList,
          allLatest: getLatest100Map(),
          isMockData: false,
        });
      } catch (dbError: any) {
        console.error("MongoDB Atlas query error:", dbError);
        // Fallback to in-memory store
        return getFallbackResponse(binIdParam, includeHistory, limit, dbError.message);
      }
    } else {
      // In-memory fallback
      return getFallbackResponse(binIdParam, includeHistory, limit);
    }
  } catch (error: any) {
    console.error("Unexpected error in GET /api/bin-data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve bin readings: " + error.message },
      { status: 500 }
    );
  }
}

function getFallbackResponse(
  binIdParam: string,
  includeHistory: boolean,
  limit: number,
  dbWarning?: string
) {
  const allReadings: BinReading[] = getMockReadings();
  const all100Bins = ALL_100_BINS.map((b) => b.id);
  const distinctBins = Array.from(new Set([...all100Bins, ...allReadings.map((r: BinReading) => r.bin_id)]));

  const targetBinId = binIdParam || distinctBins[0];
  const filtered = allReadings.filter(
    (r) => !targetBinId || r.bin_id.toLowerCase() === targetBinId.toLowerCase()
  );

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const latest = sorted.length > 0 ? sorted[0] : (getLatest100Map()[targetBinId] || null);
  const history = includeHistory ? sorted.slice(0, limit) : [];

  return NextResponse.json({
    success: true,
    latest,
    history,
    bins: distinctBins,
    allLatest: getLatest100Map(),
    isMockData: true,
    warning: dbWarning
      ? `MongoDB connection issue: ${dbWarning}. Displaying in-memory data.`
      : "MONGODB_URI not configured in .env. Displaying preview data.",
  });
}
