'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  ZoomIn, ZoomOut, Compass, Layers, ShieldCheck, 
  Flame, TrendingUp, Sparkles, AlertTriangle, Crosshair, MapPin
} from 'lucide-react';

const METRO_PRESETS = [
  { id: 'all_india', label: 'All India', coords: [22.8, 80.5], zoom: 5 },
  { id: 'kolkata', label: 'Kolkata Metro', coords: [22.60, 88.42], zoom: 12 },
  { id: 'delhi', label: 'Delhi NCR', coords: [28.55, 77.20], zoom: 11 },
  { id: 'bengaluru', label: 'Bengaluru Tech', coords: [12.96, 77.65], zoom: 11 },
  { id: 'mumbai', label: 'Mumbai Metro', coords: [19.10, 72.88], zoom: 11 },
];

export function IndiaH3DemandMap({
  forecasts = [],
  selectedCell = null,
  onSelectCell = () => {},
  targetDate = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const leafletRef = useRef(null);

  const [activeMetro, setActiveMetro] = useState('all_india');
  const [isMapReady, setIsMapReady] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Group forecasts by h3Index so each cell displays its aggregate demand and top service
  const aggregatedCells = React.useMemo(() => {
    const map = new Map();

    forecasts.forEach((f) => {
      const idx = f.h3Index;
      if (!idx) return;

      if (!map.has(idx)) {
        map.set(idx, {
          h3Index: idx,
          latitude: f.latitude,
          longitude: f.longitude,
          boundary: f.boundary,
          totalDemand: 0,
          maxDemand: 0,
          topService: f.serviceName,
          topCategory: f.serviceCategory || 'General',
          confidence: f.confidence || 0.85,
          lowerBound: 0,
          upperBound: 0,
          demandLevel: f.demandLevel || 'LOW',
          services: [],
        });
      }

      const item = map.get(idx);
      item.totalDemand += f.predictedDemand;
      item.lowerBound += f.lowerBound || f.predictedDemand;
      item.upperBound += f.upperBound || f.predictedDemand;
      if (f.predictedDemand > item.maxDemand) {
        item.maxDemand = f.predictedDemand;
        item.topService = f.serviceName;
        item.topCategory = f.serviceCategory || item.topCategory;
      }
      item.services.push(f);
    });

    // Recompute overall demand level
    for (const item of map.values()) {
      item.totalDemand = Math.round(item.totalDemand * 10) / 10;
      item.lowerBound = Math.round(item.lowerBound * 10) / 10;
      item.upperBound = Math.round(item.upperBound * 10) / 10;

      if (item.totalDemand >= 25.0 || item.maxDemand >= 8.0) {
        item.demandLevel = 'SURGE';
      } else if (item.totalDemand >= 15.0 || item.maxDemand >= 5.0) {
        item.demandLevel = 'HIGH';
      } else if (item.totalDemand >= 8.0 || item.maxDemand >= 2.5) {
        item.demandLevel = 'MODERATE';
      } else {
        item.demandLevel = 'LOW';
      }
    }

    return Array.from(map.values());
  }, [forecasts]);

  // Color config according to demand intensity
  const getIntensityColors = (level) => {
    switch (level) {
      case 'SURGE':
        return {
          stroke: '#E11D48', // Rose 600
          fill: '#F43F5E',
          fillOpacity: 0.55,
          weight: 2.5,
          bgBadge: 'bg-rose-500 text-white',
          label: 'SURGE DEMAND',
        };
      case 'HIGH':
        return {
          stroke: '#EA580C', // Orange 600
          fill: '#FB923C',
          fillOpacity: 0.45,
          weight: 2,
          bgBadge: 'bg-amber-500 text-white',
          label: 'HIGH DEMAND',
        };
      case 'MODERATE':
        return {
          stroke: '#2563EB', // Blue 600
          fill: '#60A5FA',
          fillOpacity: 0.35,
          weight: 1.5,
          bgBadge: 'bg-blue-600 text-white',
          label: 'MODERATE',
        };
      default:
        return {
          stroke: '#059669', // Emerald 600
          fill: '#34D399',
          fillOpacity: 0.25,
          weight: 1.2,
          bgBadge: 'bg-emerald-600 text-white',
          label: 'NORMAL',
        };
    }
  };

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        leafletRef.current = L;

        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [22.8, 80.5],
            zoom: 5,
            minZoom: 4,
            maxZoom: 18,
            zoomControl: false,
            attributionControl: false,
          });

          // Clean, modern Voyager base tile layer (CartoDB)
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
          }).addTo(map);

          const polyLayer = L.layerGroup().addTo(map);
          polygonLayerRef.current = polyLayer;
          mapInstanceRef.current = map;

          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 200);

          setIsMapReady(true);
        }
      } catch (err) {
        console.warn('Leaflet map initialization notice:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        polygonLayerRef.current = null;
      }
    };
  }, []);

  // 2. Render H3 Polygons whenever aggregatedCells or selectedCell updates
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const layer = polygonLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    aggregatedCells.forEach((cellData) => {
      if (!cellData.boundary || cellData.boundary.length < 3) return;

      const isSelected = selectedCell?.h3Index === cellData.h3Index;
      const colors = getIntensityColors(cellData.demandLevel);

      const polygon = L.polygon(cellData.boundary, {
        color: isSelected ? '#1F4072' : colors.stroke,
        weight: isSelected ? 3.5 : colors.weight,
        fillColor: colors.fill,
        fillOpacity: isSelected ? 0.70 : colors.fillOpacity,
        dashArray: isSelected ? '4, 4' : null,
        className: 'cursor-pointer transition-all duration-300',
      });

      // Interactive Hover & Click
      polygon.on('mouseover', () => {
        polygon.setStyle({
          weight: 3.5,
          fillOpacity: 0.75,
          color: '#0F172A',
        });
        setHoveredCell(cellData);
      });

      polygon.on('mouseout', () => {
        polygon.setStyle({
          color: isSelected ? '#1F4072' : colors.stroke,
          weight: isSelected ? 3.5 : colors.weight,
          fillOpacity: isSelected ? 0.70 : colors.fillOpacity,
        });
        setHoveredCell(null);
      });

      polygon.on('click', () => {
        onSelectCell(cellData);
        if (mapInstanceRef.current && cellData.latitude && cellData.longitude) {
          mapInstanceRef.current.flyTo([cellData.latitude, cellData.longitude], Math.max(mapInstanceRef.current.getZoom(), 12), {
            duration: 1.2,
          });
        }
      });

      // Leaflet Tooltip
      polygon.bindTooltip(
        `<div class="text-xs font-sans p-1">
          <div class="font-extrabold text-slate-900">Hex ${cellData.h3Index.slice(0, 8)}...</div>
          <div class="text-slate-600 font-medium">Pred Demand: <strong class="text-indigo-900">${cellData.totalDemand}</strong> jobs/day</div>
          <div class="text-[10px] text-slate-500">Confidence: ${(cellData.confidence * 100).toFixed(0)}%</div>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );

      polygon.addTo(layer);
    });
  }, [isMapReady, aggregatedCells, selectedCell, onSelectCell]);

  // Handle Preset FlyTo
  const handleMetroJump = (preset) => {
    setActiveMetro(preset.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(preset.coords, preset.zoom, {
        duration: 1.5,
      });
    }
  };

  const handleZoom = (delta) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  return (
    <div className="relative w-full h-[580px] sm:h-[640px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-900">
      
      {/* Map Target DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Top Left: Metro Focus Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md">
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 text-xs font-bold border-r border-slate-200/80">
          <MapPin className="w-3.5 h-3.5 text-[#1F4072]" />
          <span>Jump to Cluster:</span>
        </div>
        {METRO_PRESETS.map((preset) => {
          const isActive = activeMetro === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleMetroJump(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#1F4072] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Floating Top Right: Zoom & Control Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md">
        <button
          type="button"
          onClick={() => handleZoom(1)}
          title="Zoom In"
          className="p-2 text-slate-700 hover:text-[#1F4072] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          title="Zoom Out"
          className="p-2 text-slate-700 hover:text-[#1F4072] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleMetroJump(METRO_PRESETS[0])}
          title="Reset Full India View"
          className="p-2 text-slate-700 hover:text-[#1F4072] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-t border-slate-200/60"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom Left: H3 Demand Intensity Legend */}
      <div className="absolute bottom-4 left-4 z-10 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md text-xs space-y-2 max-w-xs">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
          <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
            <Layers className="w-3.5 h-3.5 text-[#1F4072]" />
            <span>H3 Hex Spatial Intensity (Res 7)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">~5.16 km² / cell</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500 border border-rose-600 shrink-0" />
            <span className="text-slate-700">Surge (≥ 8 jobs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-orange-400 border border-orange-500 shrink-0" />
            <span className="text-slate-700">High (5–8 jobs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-400 border border-blue-500 shrink-0" />
            <span className="text-slate-700">Moderate (2.5–5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-400 border border-emerald-500 shrink-0" />
            <span className="text-slate-700">Low (&lt; 2.5 jobs)</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
          <span>Target Horizon: <strong>{targetDate || 'Next 7 Days'}</strong></span>
          <span className="text-[#1F4072] font-bold">XGBoost ML v1.0.0</span>
        </div>
      </div>

      {/* Floating Bottom Right: Selected / Hovered Hexagon Peek Card */}
      {(hoveredCell || selectedCell) && (
        <div className="absolute bottom-4 right-4 z-10 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg text-xs space-y-2 max-w-[280px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#1F4072] border border-blue-200/60">
              Hex Sector
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${getIntensityColors((hoveredCell || selectedCell).demandLevel).bgBadge}`}>
              {(hoveredCell || selectedCell).demandLevel}
            </span>
          </div>

          <div>
            <div className="font-mono text-slate-900 font-black text-sm tracking-tight truncate">
              {(hoveredCell || selectedCell).h3Index}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
              Top Demand: <strong className="text-slate-900">{(hoveredCell || selectedCell).topService}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100 text-[11px]">
            <div>
              <div className="text-slate-400 text-[10px]">Exp. Demand</div>
              <div className="font-extrabold text-slate-900 text-sm">
                {(hoveredCell || selectedCell).totalDemand} <span className="text-[10px] font-normal text-slate-500">jobs/day</span>
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">90% Conf. Bound</div>
              <div className="font-bold text-slate-700 text-xs">
                {(hoveredCell || selectedCell).lowerBound} – {(hoveredCell || selectedCell).upperBound}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic text-right">
            Click hexagon for full breakdown
          </div>
        </div>
      )}

    </div>
  );
}
