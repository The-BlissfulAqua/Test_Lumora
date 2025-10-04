
import React, { useState, useEffect, useCallback } from 'react';
import MapView from '../components/MapView';
import AlertDetailPanel from '../components/AlertDetailPanel';
import SystemHealthPanel from '../components/SystemHealthPanel';
import TamperProofLog from '../components/TamperProofLog';
import AlertExplanationPanel from '../components/AlertExplanationPanel';
import { MissionService } from '../services/MissionService';
import { Alert } from '../types';
import IncidentCard from '../components/IncidentCard';

const CommandDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const updateDashboardState = useCallback(() => {
    const currentAlerts = MissionService.getAlerts();
    setAlerts(currentAlerts);

    if (selectedAlert) {
      const updatedSelectedAlert = currentAlerts.find(a => a.id === selectedAlert.id);
      setSelectedAlert(updatedSelectedAlert || null);
    }
  }, [selectedAlert]);

  useEffect(() => {
    updateDashboardState();
    const unsubscribe = MissionService.subscribe(updateDashboardState);
    return () => unsubscribe();
  }, [updateDashboardState]);

  const handleAlertSelect = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleMapClick = () => {
    setSelectedAlert(null);
  }

  return (
    <div className="animate-fadeIn grid grid-cols-12 gap-6 h-full">
      {/* Main Content Area */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <div className="flex-grow min-h-[400px]">
           <MapView alerts={alerts} selectedAlertId={selectedAlert?.id} onMarkerClick={handleAlertSelect} onMapClick={handleMapClick} />
        </div>
        <div className="h-64">
          <TamperProofLog alerts={alerts} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 max-h-[calc(100vh-6rem)]">
        <div className="flex-shrink-0">
          {selectedAlert ? (
            <div className="space-y-6">
              <AlertDetailPanel alert={selectedAlert} />
              <AlertExplanationPanel alert={selectedAlert} />
            </div>
          ) : (
            <SystemHealthPanel />
          )}
        </div>
        <div className="bg-navy-light rounded-2xl shadow-lg p-6 flex flex-col flex-grow min-h-0">
          <h3 className="text-xl font-bold text-accent-cyan mb-4 flex-shrink-0">Alerts Feed</h3>
          <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
            {alerts.map(alert => (
              <IncidentCard
                key={alert.id}
                alert={alert}
                isSelected={selectedAlert?.id === alert.id}
                onClick={handleAlertSelect}
                showCheckbox={false}
                showTimelineButton={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandDashboard;
