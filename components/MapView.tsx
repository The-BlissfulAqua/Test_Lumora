import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Alert, AlertLevel } from '../types';

interface MapViewProps {
  alerts: Alert[];
  selectedAlertId?: string;
  onMarkerClick: (alert: Alert) => void;
  onMapClick: () => void;
}

// Bounding box for India (approximate)
const MAP_BOUNDS = {
  latMin: 6.75,
  latMax: 35.5,
  lngMin: 68.0,
  lngMax: 97.5,
};

const MapView: React.FC<MapViewProps> = ({ alerts, selectedAlertId, onMarkerClick, onMapClick }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  const getPosition = (lat: number, lng: number) => {
    const top = 100 - ((lat - MAP_BOUNDS.latMin) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin) * 100);
    const left = (lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin) * 100;
    return { top: `${top}%`, left: `${left}%` };
  };

  const markerColorMap = {
    [AlertLevel.CRITICAL]: 'bg-alert-red',
    [AlertLevel.WARNING]: 'bg-alert-yellow',
    [AlertLevel.INFO]: 'bg-slate-dark',
  };
  
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map once
    if (!leafletMapRef.current) {
      const centerLat = (MAP_BOUNDS.latMin + MAP_BOUNDS.latMax) / 2;
      const centerLng = (MAP_BOUNDS.lngMin + MAP_BOUNDS.lngMax) / 2;
      const map = L.map(mapRef.current, { zoomControl: true }).setView([centerLat, centerLng], 5);

      // Dark tile layer (CartoDB Dark Matter) with English labels. If dark looks
      // bad we can switch to Positron (light) later.
      const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      });

      const lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      });

      // Prefer dark by default for the app's theme; fallback to light if desired.
      darkTiles.addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current as L.Map;

    // Clear existing layers except the base tile layer(s)
    map.eachLayer(layer => {
      // Keep tile layers (have a getTileUrl function), remove others
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // Add markers from alerts and draw threat lines from nearest border anchor
    const anchorPoints = [
      { id: 'pakistan', name: 'Pakistan', lat: 27.0, lng: 70.0 },
      { id: 'china', name: 'China', lat: 34.0, lng: 80.0 },
      { id: 'bangladesh', name: 'Bangladesh', lat: 24.0, lng: 92.0 },
    ];

    const markers: L.Marker[] = [];
    const polylines: L.Polyline[] = [];

    const toLatLng = (c: { lat: number; lng: number }) => new L.LatLng(c.lat, c.lng);

    alerts.forEach(alert => {
      const pos = toLatLng(alert.coordinates);
      const color = alert.level === AlertLevel.CRITICAL ? '#ff4d4f' : alert.level === AlertLevel.WARNING ? '#ffbf47' : '#9aa4b2';

      const marker = L.circleMarker(pos, {
        radius: 6,
        fillColor: color,
        color: '#ffffff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.bindPopup(`<strong>${alert.title}</strong><br/>${alert.location}<br/>${alert.timestamp}`);
      marker.on('click', () => onMarkerClick(alert));
      markers.push(marker);

      // Determine nearest anchor
      let nearest = anchorPoints[0];
      let bestDist = pos.distanceTo(L.latLng(nearest.lat, nearest.lng));
      for (let i = 1; i < anchorPoints.length; i++) {
        const ap = anchorPoints[i];
        const d = pos.distanceTo(L.latLng(ap.lat, ap.lng));
        if (d < bestDist) {
          bestDist = d;
          nearest = ap;
        }
      }

      const poly = L.polyline([ [nearest.lat, nearest.lng], [alert.coordinates.lat, alert.coordinates.lng] ], {
        color: '#ff4d4f',
        weight: 2,
        opacity: 0.8,
      }).addTo(map);
      polylines.push(poly);
    });

    // Fit bounds to show India nicely
    map.fitBounds([[MAP_BOUNDS.latMin, MAP_BOUNDS.lngMin], [MAP_BOUNDS.latMax, MAP_BOUNDS.lngMax]], { padding: [40, 40] });

    return () => {
      markers.forEach(m => map.removeLayer(m));
      polylines.forEach(p => map.removeLayer(p));
    };

  }, [alerts, onMarkerClick]);

  return (
    <div className="bg-navy-dark rounded-2xl shadow-lg p-4 h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 border-4 border-navy-light rounded-2xl pointer-events-none"></div>
      <div ref={mapRef} className="h-full rounded-2xl" />
    </div>
  );
};

export default MapView;
