"use client";

import React, { useState } from "react";
import { MapPin, ExternalLink, Copy, Check, Navigation } from "lucide-react";

interface MapWidgetProps {
  latitude: number;
  longitude: number;
  binId: string;
}

export default function MapWidget({ latitude, longitude, binId }: MapWidgetProps) {
  const [copied, setCopied] = useState(false);

  // Safe fallback coordinates (e.g. 28.6139, 77.2090)
  const lat = isNaN(latitude) ? 28.6139 : latitude;
  const lng = isNaN(longitude) ? 77.2090 : longitude;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.006}%2C${lat - 0.004}%2C${lng + 0.006}%2C${lat + 0.004}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
                Geolocation & GPS
              </h3>
              <p className="text-xs text-slate-400">Bin Location: {binId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700"
              title="Copy GPS coordinates"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-md shadow-indigo-950"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Route</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Coordinates Display Badges */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block">
              Latitude
            </span>
            <span className="text-sm font-mono font-bold text-indigo-300">
              {lat.toFixed(6)}° N
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block">
              Longitude
            </span>
            <span className="text-sm font-mono font-bold text-indigo-300">
              {lng.toFixed(6)}° E
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Map Visual */}
      <div className="mt-4 relative h-48 w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-inner group">
        <iframe
          title={`Map location for ${binId}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={osmEmbedUrl}
          className="filter contrast-[0.95] brightness-[0.9] invert-[0.9] hue-rotate-[185deg] w-full h-full opacity-90 transition-opacity group-hover:opacity-100"
        />
        <div className="absolute bottom-2 left-2 z-10 px-2.5 py-1 rounded-md bg-slate-950/90 backdrop-blur-sm border border-slate-800 text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live GPS Position
        </div>
      </div>
    </div>
  );
}
