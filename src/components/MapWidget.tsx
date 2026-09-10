"use client";

import React, { useState } from "react";
import { MapPin, ExternalLink, Copy, Check, Navigation } from "lucide-react";

interface MapWidgetProps {
  latitude: number;
  longitude: number;
  binId: string;
  binName?: string;
}

export default function MapWidget({ latitude, longitude, binId, binName = "Dustbin 1" }: MapWidgetProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                GPS Location & Map
              </h3>
              <p className="text-xs text-slate-500">{binName} ({binId})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Route</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Coordinates Badges */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Latitude
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-800">
              {lat.toFixed(6)}° N
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Longitude
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-800">
              {lng.toFixed(6)}° E
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Map */}
      <div className="mt-4 relative h-44 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <iframe
          title={`Map location for ${binId}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={osmEmbedUrl}
          className="w-full h-full"
        />
        <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded-md bg-white/95 backdrop-blur-sm border border-slate-200 text-[10px] font-medium text-slate-700 shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Current Device Position
        </div>
      </div>
    </div>
  );
}
