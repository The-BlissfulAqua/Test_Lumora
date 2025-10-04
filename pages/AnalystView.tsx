import React, { useState, useEffect, useMemo } from 'react';
import { MissionService } from '../services/MissionService';
import { Alert, AlertLevel } from '../types';
import IncidentCard from '../components/IncidentCard';
import IncidentTimeline from '../components/IncidentTimeline';
import GeminiAssessmentPanel from '../components/GeminiAssessmentPanel';
import { exportAlertsToCSV } from '../utils/export';

const AnalystView: React.FC = () => {
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set());
  const [activeTimelineAlert, setActiveTimelineAlert] = useState<Alert | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertLevel | 'all'>('all');

  useEffect(() => {
    // Fetch all historical data on mount
    const alerts = MissionService.getAlerts();
    setAllAlerts(alerts);
    if (alerts.length > 0) {
      setActiveTimelineAlert(alerts[0]);
    }
  }, []);

  const filteredAlerts = useMemo(() => {
    return allAlerts
      .filter(alert => severityFilter === 'all' || alert.level === severityFilter)
      .filter(alert => alert.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allAlerts, searchTerm, severityFilter]);

  const handleAlertSelect = (alertId: string, isSelected: boolean) => {
    setSelectedAlertIds(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(alertId);
      } else {
        newSet.delete(alertId);
      }
      return newSet;
    });
  };

  const handleViewOnTimeline = (alert: Alert) => {
    setActiveTimelineAlert(alert);
  };

  const selectedAlerts = useMemo(() => {
    return allAlerts.filter(alert => selectedAlertIds.has(alert.id));
  }, [allAlerts, selectedAlertIds]);

  const handleExport = () => {
    exportAlertsToCSV(filteredAlerts, `bordersentinel_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="animate-fadeIn grid grid-cols-12 gap-6 h-full">
      {/* Column 1: Incidents List & Filters */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 max-h-[calc(100vh-6rem)]">
        <div className="bg-navy-light rounded-2xl shadow-lg p-4 flex-shrink-0">
          <h3 className="text-xl font-bold text-accent-cyan mb-3">Filter Incidents</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-command-blue border border-navy-dark rounded-md px-3 py-2 text-sm text-slate-light focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as AlertLevel | 'all')}
              className="w-full bg-command-blue border border-navy-dark rounded-md px-3 py-2 text-sm text-slate-light focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            >
              <option value="all">All Severities</option>
              <option value={AlertLevel.CRITICAL}>{AlertLevel.CRITICAL}</option>
              <option value={AlertLevel.WARNING}>{AlertLevel.WARNING}</option>
              <option value={AlertLevel.INFO}>{AlertLevel.INFO}</option>
            </select>
            <button
                onClick={handleExport}
                className="w-full mt-2 bg-accent-cyan text-command-blue font-bold py-2 rounded-md hover:bg-opacity-80 disabled:opacity-50"
            >
                Export Filtered to CSV
            </button>
          </div>
        </div>
        <div className="bg-navy-light rounded-2xl shadow-lg p-4 flex flex-col flex-grow min-h-0">
            <h3 className="text-xl font-bold text-accent-cyan mb-3 flex-shrink-0">Incident Log</h3>
            <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                {filteredAlerts.map(alert => (
                    <IncidentCard 
                        key={alert.id}
                        alert={alert}
                        isSelected={selectedAlertIds.has(alert.id)}
                        onSelect={handleAlertSelect}
                        onViewOnTimeline={handleViewOnTimeline}
                    />
                ))}
            </div>
        </div>
      </div>

      {/* Column 2: Correlation Timeline */}
      <div className="col-span-12 lg:col-span-4 flex flex-col">
        <IncidentTimeline
          activeAlert={activeTimelineAlert}
          allAlerts={allAlerts}
        />
      </div>

      {/* Column 3: AI Analysis */}
      <div className="col-span-12 lg:col-span-4 flex flex-col">
        <GeminiAssessmentPanel selectedAlerts={selectedAlerts} />
      </div>
    </div>
  );
};

export default AnalystView;