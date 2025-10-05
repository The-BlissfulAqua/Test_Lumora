
import React, { useState, useEffect, useCallback } from 'react';
import MapView from '../components/MapView';
import AlertDetailPanel from '../components/AlertDetailPanel';
import SystemHealthPanel from '../components/SystemHealthPanel';
import TamperProofLog from '../components/TamperProofLog';
import AlertExplanationPanel from '../components/AlertExplanationPanel';
import { MissionService } from '../services/MissionService';
import { Alert } from '../types';
import IncidentCard from '../components/IncidentCard';
import { DemoService } from '../services/DemoService';
import { generateDemoAlerts } from '../services/DemoGenerator';
import { SystemHealthService } from '../services/SystemHealthService';

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

  // React to demo mode toggles
  useEffect(() => {
    let healthInterval: number | undefined;

    const handleDemoChange = (active: boolean) => {
      if (active) {
        const demo = generateDemoAlerts(6);
        MissionService.setAlerts(demo);
        healthInterval = window.setInterval(() => SystemHealthService.randomize(), 15000);
      } else {
        if (healthInterval) {
          clearInterval(healthInterval);
          healthInterval = undefined;
        }
        MissionService.clearAlerts();
        SystemHealthService.reset();
      }
    };

    // If demo is already active on mount, seed it. Otherwise don't clear existing alerts.
    if (DemoService.isActive()) {
      handleDemoChange(true);
    }

    const unsub = DemoService.subscribe((active) => {
      // only react to real toggles: when active => seed; when inactive => clear
      if (active) handleDemoChange(true);
      else handleDemoChange(false);
    });
    return () => {
      unsub();
      if (healthInterval) clearInterval(healthInterval);
    };
  }, []);

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-light">Operations Map</h2>
          <div>
            <button
              onClick={() => {
                DemoService.toggleDemo();
                if (!DemoService.isActive()) {
                  // turned off -> clear demo alerts
                  MissionService.clearAlerts();
                  SystemHealthService.reset();
                } else {
                  // turned on -> seed immediately
                  const demo = generateDemoAlerts(6);
                  MissionService.setAlerts(demo);
                }
              }}
              className={`px-3 py-1 rounded-md font-medium ${DemoService.isActive() ? 'bg-alert-red text-command-blue' : 'bg-accent-cyan text-command-blue'}`}
            >
              {DemoService.isActive() ? 'Stop Demo' : 'Start Demo'}
            </button>
          </div>
        </div>
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
