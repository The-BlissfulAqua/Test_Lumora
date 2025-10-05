import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Marker cluster (optional). The project ships the dependency; if it's not
// installed, importing will fail at runtime but the code guards against
// cluster usage where possible.
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// @ts-ignore - markercluster augmentations are not in our TS types
import 'leaflet.markercluster';
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

      // Voyager tiles (Carto) provide good contrast and English labels, while
      // still fitting a darker UI better than bright default tiles.
      const voyagerTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      });

      voyagerTiles.addTo(map);

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

      // Helper: map alert level to color
      const getColorByLevel = (level: AlertLevel) => {
        switch (level) {
          case AlertLevel.CRITICAL: return '#ff4d4f'; // red
          case AlertLevel.WARNING: return '#ffbf47'; // yellow/orange
          case AlertLevel.INFO: return '#4fb3ff'; // blue
          default: return '#9aa4b2';
        }
      };

      // Add markers from alerts and draw threat lines from nearest border anchor
    // Anchor points placed roughly around India's borders (multiple points
    // around the perimeter) so threat pointers originate from border-adjacent
    // locations rather than a single inland point.
    const anchorPoints = [
      { id: 'pak_west', name: 'Pakistan-West', lat: 24.5, lng: 69.5 }, // Rann of Kutch (west)
      { id: 'pak_northwest', name: 'Pakistan-NW', lat: 32.5, lng: 74.0 }, // near Punjab (NW)
      { id: 'china_north', name: 'China-North', lat: 34.5, lng: 78.5 }, // Himalayas (north)
      { id: 'nepal', name: 'Nepal', lat: 28.4, lng: 84.1 }, // northern border (central)
      { id: 'bangladesh', name: 'Bangladesh-East', lat: 24.0, lng: 91.5 }, // east border
      { id: 'myanmar', name: 'Myanmar-SE', lat: 22.0, lng: 96.0 }, // southeast
      { id: 'sri_lanka', name: 'SriLanka-South', lat: 7.8, lng: 81.0 }, // south
    ];
    const anchorMap = Object.fromEntries(anchorPoints.map(a => [a.id, a]));

    // Add small visible markers for anchor points so users can see source locations
    const anchorMarkers: L.Marker[] = [];
    anchorPoints.forEach(a => {
      const anchorIcon = L.divIcon({
        className: 'border-anchor-icon',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#0ea5a6;border:2px solid #021826"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const am = L.marker([a.lat, a.lng], { icon: anchorIcon, interactive: false }).addTo(map);
      anchorMarkers.push(am);
    });

    const markers: L.Marker[] = [];
    const polylines: L.Polyline[] = [];

    // Try to create a marker cluster group if available
    let clusterGroup: any = null;
    try {
      // @ts-ignore
      clusterGroup = (L as any).markerClusterGroup ? (L as any).markerClusterGroup() : null;
      if (clusterGroup) map.addLayer(clusterGroup);
    } catch (e) {
      clusterGroup = null;
    }

    const toLatLng = (c: { lat: number; lng: number }) => new L.LatLng(c.lat, c.lng);

    alerts.forEach(alert => {
      const pos = toLatLng(alert.coordinates);

      // Normalize level to support enum values or raw strings
      const normalizeLevel = (l: any) => (typeof l === 'string' ? l.toLowerCase() : String(l).toLowerCase());
      const levelKey = normalizeLevel(alert.level);
      const color = levelKey.includes('critical') ? '#ff4d4f' : levelKey.includes('warning') ? '#ffbf47' : levelKey.includes('info') ? '#4fb3ff' : '#9aa4b2';

      // Decide if the alert is in-region (full color + polyline) or out-of-region (dim marker only)
      const buffer = 2.0; // degrees buffer around MAP_BOUNDS
      const inRegion = (
        alert.coordinates.lat >= (MAP_BOUNDS.latMin - buffer) &&
        alert.coordinates.lat <= (MAP_BOUNDS.latMax + buffer) &&
        alert.coordinates.lng >= (MAP_BOUNDS.lngMin - buffer) &&
        alert.coordinates.lng <= (MAP_BOUNDS.lngMax + buffer)
      );

      // Marker style: bright for in-region or if explicit threatSource; dim otherwise
      const hasExplicitSource = !!((alert as any).threatSource);
      const isActive = inRegion || hasExplicitSource;
      const markerOptions: L.CircleMarkerOptions = {
        radius: isActive ? 8 : 5,
        fillColor: isActive ? color : '#6b7280',
        color: '#ffffff',
        weight: 1,
        opacity: 1,
        fillOpacity: isActive ? 0.95 : 0.5,
      };

      const marker = L.circleMarker(pos, markerOptions);
      if (clusterGroup) {
        clusterGroup.addLayer(marker);
      } else {
        marker.addTo(map);
      }
      const popupContent = `<div style="min-width:180px"><strong>${alert.title}</strong><br/><small>${alert.location}</small><br/><em>${alert.timestamp}</em><div style="margin-top:6px">Severity: ${alert.level}</div></div>`;
      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onMarkerClick(alert);
        marker.openPopup();
      });
      markers.push(marker);

      // Only draw threat pointers for alerts inside (or near) the India region,
      // or when an explicit threatSource is provided in the alert data.
      // This prevents long, global connectors when alerts outside the operational
      // area are present in the dataset.

      // Determine source anchor: prefer explicit `threatSource` field on the
      // alert (e.g., 'pakistan'|'china'|'bangladesh'). If not present, only
      // fallback to nearest anchor when the alert is inside the region.
      let sourceAnchor = null as null | { id: string; name: string; lat: number; lng: number };
      const threatSourceField = (alert as any).threatSource as string | undefined;
      if (threatSourceField && anchorMap[threatSourceField]) {
        sourceAnchor = anchorMap[threatSourceField];
      } else if (inRegion) {
        // fallback: nearest
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
        sourceAnchor = nearest;
      }

      if (!sourceAnchor) {
        // No valid anchor determined (alert out of region and no threatSource)
        // => do not draw a polyline
        return;
      }

      // Use the determined sourceAnchor (explicit or nearest-in-region)
      const src = sourceAnchor as { id: string; name: string; lat: number; lng: number };

      // Create a styled polyline colored by severity from the sourceAnchor -> alert
      // Only draw polylines for active alerts (in-region or explicit source)
      const poly = isActive ? L.polyline([ [src.lat, src.lng], [alert.coordinates.lat, alert.coordinates.lng] ], {
        color: color,
        weight: 4,
        opacity: 0.95,
        interactive: true,
        dashArray: levelKey.includes('critical') ? undefined : '6,6',
      }).addTo(map) : null;

      // Bind popup to the polyline and make it clickable
      if (poly) {
        poly.bindPopup(popupContent);
        poly.on('click', () => {
          poly.openPopup();
          // also call onMarkerClick so app state can respond
          onMarkerClick(alert);
        });
        polylines.push(poly);
      }
    });

    // Fit bounds to show India nicely
    map.fitBounds([[MAP_BOUNDS.latMin, MAP_BOUNDS.lngMin], [MAP_BOUNDS.latMax, MAP_BOUNDS.lngMax]], { padding: [40, 40] });

    // cleanup anchor markers & clusters when effect re-runs
    return () => {
      if (clusterGroup) {
        try { map.removeLayer(clusterGroup); } catch (e) {}
      } else {
        markers.forEach(m => map.removeLayer(m));
      }
      polylines.forEach(p => map.removeLayer(p));
      anchorMarkers.forEach(a => map.removeLayer(a));
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
