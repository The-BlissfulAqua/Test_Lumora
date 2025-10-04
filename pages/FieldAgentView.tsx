import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertStatus, Evidence } from '../types';
import { MissionService } from '../services/MissionService';
import AgentMapView from '../components/AgentMapView';
import DispatchLog from '../components/DispatchLog';
import EvidenceUploader from '../components/EvidenceUploader';
import MissionSummaryPanel from '../components/MissionSummaryPanel';

// Simulate a queue for offline actions
type QueuedAction = () => void;
let actionQueue: QueuedAction[] = [];

const FieldAgentView: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  const updateAlerts = useCallback(() => {
    const allAlerts = MissionService.getAlerts();
    setAlerts(allAlerts.filter(a => a.status !== AlertStatus.RESOLVED));
    if (selectedAlert) {
        setSelectedAlert(allAlerts.find(a => a.id === selectedAlert.id) || null);
    }
  }, [selectedAlert]);

  useEffect(() => {
    updateAlerts();
    const unsubscribe = MissionService.subscribe(updateAlerts);
    return () => unsubscribe();
  }, [updateAlerts]);

  useEffect(() => {
    if (alerts.length > 0 && !selectedAlert) {
      setSelectedAlert(alerts[0]);
    } else if (alerts.length === 0) {
      setSelectedAlert(null);
    }
  }, [alerts, selectedAlert]);
  
  const processQueue = () => {
      actionQueue.forEach(action => action());
      actionQueue = [];
      setPendingActions(0);
  };

  const handleToggleOffline = () => {
      const newOfflineState = !isOffline;
      setIsOffline(newOfflineState);
      if (!newOfflineState) { // Coming back online
          processQueue();
      }
  };
  
  const performAction = (action: QueuedAction, isImmediate: boolean = false) => {
      if (isOffline && !isImmediate) {
          actionQueue.push(action);
          setPendingActions(actionQueue.length);
      } else {
          action();
      }
  };

  const handleAcknowledge = () => {
    if (!selectedAlert) return;
    performAction(() => MissionService.acknowledgeAlert(selectedAlert.id));
  };
  
  const handleSendMessage = (text: string) => {
      if (!selectedAlert) return;
      performAction(() => MissionService.addMessage(selectedAlert.id, { sender: 'Agent', text }));
  };
  
  const handleUploadEvidence = (evidence: Omit<Evidence, 'id' | 'timestamp'>) => {
      if (!selectedAlert) return;
      performAction(() => MissionService.addEvidence(selectedAlert.id, evidence));
  };


  return (
    <div className="animate-fadeIn h-full flex flex-col">
       {/* Offline Mode Toggle */}
       <div className="flex-shrink-0 mb-4 flex justify-end items-center space-x-3 p-2 bg-navy-light rounded-lg">
          {pendingActions > 0 && <span className="text-sm text-alert-yellow animate-pulse">{pendingActions} actions pending</span>}
          <span className="text-sm font-semibold">Network Status:</span>
          <label htmlFor="offline-toggle" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={!isOffline} onChange={handleToggleOffline} id="offline-toggle" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-health-green"></div>
            <span className={`ml-3 text-sm font-medium ${isOffline ? 'text-alert-red' : 'text-health-green'}`}>{isOffline ? 'Offline' : 'Online'}</span>
          </label>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
        {/* Alerts List */}
        <div className="md:col-span-1 bg-navy-light rounded-2xl shadow-lg p-4 flex flex-col">
          <h3 className="text-xl font-bold text-accent-cyan mb-4 flex-shrink-0">Assigned Alerts</h3>
          <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
            {alerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedAlert?.id === alert.id ? 'bg-navy-dark ring-2 ring-accent-cyan' : 'bg-navy-dark hover:bg-opacity-80'}`}
              >
                <h4 className="font-bold text-slate-light">{alert.title}</h4>
                <p className="text-sm text-slate-dark">{alert.location}</p>
                <p className={`text-xs font-bold mt-1 ${alert.status === AlertStatus.PENDING ? 'text-alert-yellow' : 'text-health-green'}`}>{alert.status}</p>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-center text-slate-dark">No active alerts.</p>}
          </div>
        </div>

        {/* Alert Details */}
        <div className="md:col-span-2 flex flex-col gap-6 min-h-0 overflow-y-auto pr-2">
          {selectedAlert ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">
                <div className="bg-navy-dark rounded-lg p-4">
                  <h4 className="text-lg font-bold text-slate-light mb-2">{selectedAlert.title}</h4>
                  <p><span className="font-semibold text-slate-dark">Location:</span> {selectedAlert.location}</p>
                  <p><span className="font-semibold text-slate-dark">Timestamp:</span> {selectedAlert.timestamp}</p>
                  {selectedAlert.status === AlertStatus.PENDING && (
                    <button onClick={handleAcknowledge} className="w-full mt-4 bg-alert-yellow text-command-blue font-bold py-2 rounded-md hover:bg-opacity-80 disabled:opacity-50">
                        {isOffline ? 'Acknowledge (Pending)' : 'Acknowledge Alert'}
                    </button>
                  )}
                </div>
                <div className="h-48 lg:h-auto min-h-[150px]">
                    <AgentMapView alerts={alerts} selectedAlertId={selectedAlert.id} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                  <div className="min-h-[300px]"><DispatchLog messages={selectedAlert.dispatchLog} onSendMessage={handleSendMessage} isOffline={isOffline} /></div>
                  <div className="min-h-[300px]"><EvidenceUploader evidence={selectedAlert.evidence} onUpload={handleUploadEvidence} isOffline={isOffline} /></div>
              </div>

              <div className="flex-shrink-0 pb-4">
                <MissionSummaryPanel alert={selectedAlert} />
              </div>
            </>
          ) : (
            <div className="bg-navy-light rounded-2xl shadow-lg p-6 flex items-center justify-center h-full">
              <p className="text-slate-dark">Select an alert to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldAgentView;
