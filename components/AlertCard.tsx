import React, { useMemo } from 'react';
import { Alert, AlertLevel } from '../types';
import { AnomalyService } from '../services/AnomalyService';

interface AlertCardProps {
  alert: Alert;
  isSelected: boolean;
  onClick: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, isSelected, onClick }) => {
  // Detect anomaly when component loads
  const anomalyData = useMemo(() => {
    return AnomalyService.detectAnomaly(alert);
  }, [alert]);

  const levelColorMap = {
    [AlertLevel.CRITICAL]: 'border-alert-red',
    [AlertLevel.WARNING]: 'border-alert-yellow',
    [AlertLevel.INFO]: 'border-slate-dark',
  };

  const levelTextMap = {
    [AlertLevel.CRITICAL]: 'text-alert-red',
    [AlertLevel.WARNING]: 'text-alert-yellow',
    [AlertLevel.INFO]: 'text-slate-light',
  };

  const selectedClass = isSelected ? 'bg-navy-dark ring-2 ring-accent-cyan' : 'bg-navy-light';

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg shadow-md border-l-4 ${levelColorMap[alert.level]} hover:bg-navy-dark cursor-pointer transition-all duration-200 ${selectedClass}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select alert: ${alert.title}, Level: ${alert.level}, Location: ${alert.location}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-slate-light">{alert.title}</h4>
        <span className={`text-xs font-bold uppercase ${levelTextMap[alert.level]}`}>
          {alert.level}
        </span>
      </div>
      
      {/* Location & Time */}
      <div className="text-sm text-slate-dark mt-2">
        <p>{alert.location}</p>
        <p>{alert.timestamp}</p>
      </div>

      {/* NEW: Anomaly Detection Info */}
      <div className="mt-3 pt-3 border-t border-navy-dark">
        <div className="space-y-2">
          {/* Anomaly Badge */}
          <div className="flex items-center justify-between">
            {anomalyData.is_anomaly ? (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-alert-red/20 text-alert-red">
                ⚠️ Anomaly
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-health-green/20 text-health-green">
                ✓ Normal
              </span>
            )}
            <span className={`text-xs font-bold ${AnomalyService.getConfidenceColor(anomalyData.confidence)}`}>
              {(anomalyData.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Priority (only if anomaly) */}
          {anomalyData.is_anomaly && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-dark">Priority:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${AnomalyService.getPriorityColor(anomalyData.priority)} text-command-blue`}>
                {anomalyData.priority}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;