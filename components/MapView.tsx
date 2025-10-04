import React from 'react';
import { Alert, AlertLevel } from '../types';

interface MapViewProps {
  alerts: Alert[];
  selectedAlertId?: string;
  onMarkerClick: (alert: Alert) => void;
  onMapClick: () => void;
}

// Bounding box for the simulated area (e.g., El Paso region)
const MAP_BOUNDS = {
  latMin: 31.75,
  latMax: 31.8,
  lngMin: -106.55,
  lngMax: -106.48,
};

const MapView: React.FC<MapViewProps> = ({ alerts, selectedAlertId, onMarkerClick, onMapClick }) => {
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
  
  return (
    <div className="bg-navy-dark rounded-2xl shadow-lg p-4 h-full flex items-center justify-center relative overflow-hidden" onClick={onMapClick}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-20"></div>
      <div className="absolute inset-0 border-4 border-navy-light rounded-2xl pointer-events-none"></div>

      {/* Map Content Placeholder */}
      <div className="text-center z-0">
         <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0 6l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-.553-.894L15 2m-6 5l6-3m0 11v-6m0 6l-6-3" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-slate-light">Live Operations Map</h3>
        <p className="mt-1 text-sm text-slate-dark">Real-time asset and alert visualization.</p>
      </div>

      {/* Alert Markers */}
      {alerts.map(alert => {
        const { top, left } = getPosition(alert.coordinates.lat, alert.coordinates.lng);
        const isSelected = alert.id === selectedAlertId;
        return (
          <div
            key={alert.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            style={{ top, left }}
            onClick={(e) => {
                e.stopPropagation();
                onMarkerClick(alert);
            }}
            title={`${alert.title} - ${alert.location}`}
          >
            <div className={`w-4 h-4 rounded-full ${markerColorMap[alert.level]} flex items-center justify-center transition-all duration-300 ${isSelected ? 'ring-4 ring-offset-2 ring-offset-navy-dark ring-accent-cyan' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${markerColorMap[alert.level]} opacity-75`}></div>
            </div>
            {isSelected && <div className={`absolute top-0 left-0 w-4 h-4 rounded-full ${markerColorMap[alert.level]} animate-ping`}></div>}
          </div>
        )
      })}
    </div>
  );
};

export default MapView;
