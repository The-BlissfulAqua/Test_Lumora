import React from 'react';
import { Alert, AlertLevel } from '../types';

interface IncidentTimelineProps {
  activeAlert: Alert | null;
  allAlerts: Alert[];
}

const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ activeAlert, allAlerts }) => {
  const getRelatedAlerts = (): Alert[] => {
    if (!activeAlert) return [];
    
    const activeTime = new Date(activeAlert.timestamp).getTime();
    const oneHour = 60 * 60 * 1000;

    return allAlerts
      .filter(alert => alert.id !== activeAlert.id)
      .filter(alert => {
        const alertTime = new Date(alert.timestamp).getTime();
        return Math.abs(activeTime - alertTime) <= oneHour;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const relatedAlerts = getRelatedAlerts();

  const levelColorMap = {
    [AlertLevel.CRITICAL]: 'bg-alert-red',
    [AlertLevel.WARNING]: 'bg-alert-yellow',
    [AlertLevel.INFO]: 'bg-slate-dark',
  };

  return (
    <div className="bg-navy-light rounded-2xl shadow-lg p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-accent-cyan mb-4 flex-shrink-0">Incident Correlation Timeline</h3>
      {activeAlert ? (
        <div className="flex-grow overflow-y-auto pr-2">
            <div className="relative border-l-2 border-slate-dark pl-6 space-y-8">
                 {/* Active Alert */}
                <div className="relative">
                    <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-accent-cyan ring-4 ring-accent-cyan/50"></div>
                    <p className="text-xs text-slate-dark">{activeAlert.timestamp}</p>
                    <h4 className="font-bold text-slate-light">{activeAlert.title} (Active)</h4>
                    <p className="text-sm text-slate-dark">{activeAlert.location}</p>
                </div>
                 {/* Related Alerts */}
                 {relatedAlerts.map(alert => (
                    <div key={alert.id} className="relative">
                        <div className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ${levelColorMap[alert.level]}`}></div>
                        <p className="text-xs text-slate-dark">{alert.timestamp}</p>
                        <h4 className="font-semibold text-slate-light">{alert.title}</h4>
                        <p className="text-sm text-slate-dark">{alert.location}</p>
                    </div>
                 ))}
                 {relatedAlerts.length === 0 && (
                    <p className="text-sm text-slate-dark pt-4">No other incidents within one hour.</p>
                 )}
            </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-slate-dark">Select an incident to view its timeline.</p>
        </div>
      )}
    </div>
  );
};

export default IncidentTimeline;
