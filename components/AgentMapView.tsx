import React from 'react';
import { Alert, AlertLevel } from '../types';

interface AgentMapViewProps {
  alerts: Alert[];
  selectedAlertId?: string;
}

// Fixed agent location for simulation
const AGENT_LOCATION = { lat: 31.778, lng: -106.50 };

const MAP_BOUNDS = {
  latMin: 31.75,
  latMax: 31.8,
  lngMin: -106.55,
  lngMax: -106.48,
};

const AgentMapView: React.FC<AgentMapViewProps> = ({ alerts, selectedAlertId }) => {
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

  const agentPos = getPosition(AGENT_LOCATION.lat, AGENT_LOCATION.lng);
  
  return (
    <div className="bg-navy-dark rounded-lg shadow-lg p-2 h-full relative overflow-hidden">
        {/* Map Placeholder */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-20"></div>

        {/* Agent Location Marker */}
         <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ top: agentPos.top, left: agentPos.left }}
            title="Your Location"
          >
            <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
        </div>

      {/* Alert Markers */}
      {alerts.map(alert => {
        const { top, left } = getPosition(alert.coordinates.lat, alert.coordinates.lng);
        const isSelected = alert.id === selectedAlertId;
        return (
          <div
            key={alert.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ top, left }}
            title={`${alert.title}`}
          >
            <div className={`w-3 h-3 rounded-full ${markerColorMap[alert.level]} transition-all duration-300 ${isSelected ? 'ring-2 ring-offset-2 ring-offset-navy-dark ring-accent-cyan' : ''}`}></div>
          </div>
        )
      })}
    </div>
  );
};

export default AgentMapView;
