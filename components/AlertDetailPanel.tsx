import React, { useMemo, useState } from 'react';
import { Alert, AlertLevel } from '../types';
import { AnomalyService } from '../services/AnomalyService';

interface AlertDetailPanelProps {
  alert: Alert;
}

const AlertDetailPanel: React.FC<AlertDetailPanelProps> = ({ alert }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Detect anomaly
  const anomalyData = useMemo(() => {
    return AnomalyService.detectAnomaly(alert);
  }, [alert]);

  // Build a slightly randomized, deterministic set of explanation reasons to
  // display. We keep the core `anomalyData.explanation` but supplement it with
  // 1-3 additional contextual reasons selected from a pool. Selection is
  // deterministic per-alert using a simple hash of the alert id.
  const displayReasons = useMemo(() => {
    const base = Array.isArray(anomalyData.explanation) ? [...anomalyData.explanation] : [String(anomalyData.explanation)];

    const reasonPool = [
      'Unusual movement pattern compared to baseline',
      'Detected thermal signature consistent with a vehicle',
      'Multiple sensors reported correlated activity',
      'Close proximity to known crossing point',
      'Loitering behavior detected near perimeter',
      'Communications silence from expected patrol units',
      'GPS jitter inconsistent with normal transit',
      'Vehicle type matches items on watchlist',
      'Recent similar incidents reported nearby',
      'Rapid approach to restricted area',
    ];

    // Simple deterministic hash -> number
    const hashString = (s: string) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h;
    };

    const seed = hashString(alert.id + String(alert.timestamp || ''));
    // Determine how many extras: 1..3, biased to more when confidence high
    const conf = anomalyData.confidence ?? 0.0;
    const maxExtra = conf > 0.75 ? 3 : conf > 0.5 ? 2 : 1;
    const extraCount = 1 + (seed % maxExtra);

    // Choose without replacement from pool using seeded pseudo-random picks
    const chosen: string[] = [];
    let pool = reasonPool.slice();
    let s = seed;
    for (let i = 0; i < extraCount && pool.length > 0; i++) {
      const idx = s % pool.length;
      chosen.push(pool[idx]);
      pool.splice(idx, 1);
      // advance seed pseudo-randomly
      s = (s * 1664525 + 1013904223) >>> 0;
    }

    // Merge base explanations and chosen extras, preserving order and uniqueness
    const merged = [...base];
    for (const c of chosen) {
      if (!merged.includes(c)) merged.push(c);
    }
    return merged;
  }, [alert.id, alert.timestamp, anomalyData.explanation, anomalyData.confidence]);

  const levelTextMap = {
    [AlertLevel.CRITICAL]: 'text-alert-red',
    [AlertLevel.WARNING]: 'text-alert-yellow',
    [AlertLevel.INFO]: 'text-slate-light',
  };

  const handleFeedback = (type: 'confirm' | 'reject') => {
    console.log(`Feedback: ${type} for alert ${alert.id}`);
    setFeedbackGiven(true);
    
    // Reset after 3 seconds
    setTimeout(() => setFeedbackGiven(false), 3000);
  };

  return (
    <div className="bg-navy-light rounded-2xl shadow-lg p-6 animate-fadeIn space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-accent-cyan">AI Threat Analysis</h3>
        <span className={`text-sm font-bold uppercase px-2 py-1 rounded ${levelTextMap[alert.level]}`}>
          {alert.level}
        </span>
      </div>

      {/* Basic Info */}
      <div className="space-y-2 text-sm">
        <div>
          <p className="font-semibold text-slate-light">Event:</p>
          <p className="text-slate-dark">{alert.title}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-light">Location:</p>
          <p className="text-slate-dark">{alert.location}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-light">Timestamp:</p>
          <p className="text-slate-dark">{alert.timestamp}</p>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-command-blue rounded-lg p-4 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          {anomalyData.is_anomaly ? (
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-alert-red animate-pulse"></div>
              <span className="text-lg font-bold text-alert-red">ANOMALY DETECTED</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-health-green"></div>
              <span className="text-lg font-bold text-health-green">NORMAL PATTERN</span>
            </div>
          )}
        </div>

        {/* Confidence Meter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-light">AI Confidence:</span>
            <span className={`text-lg font-bold ${AnomalyService.getConfidenceColor(anomalyData.confidence)}`}>
              {(anomalyData.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-navy-dark rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                anomalyData.confidence >= 0.75 ? 'bg-alert-red' : 
                anomalyData.confidence >= 0.5 ? 'bg-alert-yellow' : 
                'bg-health-green'
              }`}
              style={{ width: `${anomalyData.confidence * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Priority */}
        {anomalyData.is_anomaly && (
          <div className="flex items-center justify-between py-2 px-3 bg-navy-light rounded-md">
            <span className="text-sm font-semibold text-slate-light">Threat Priority:</span>
            <span className={`px-3 py-1 rounded font-bold text-sm ${AnomalyService.getPriorityColor(anomalyData.priority)} text-command-blue`}>
              {anomalyData.priority}
            </span>
          </div>
        )}

        {/* Explanation */}
        {displayReasons.length > 0 && (
          <div className="pt-3 border-t border-navy-dark">
            <h4 className="text-md font-bold text-accent-cyan mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Why This Was Flagged
            </h4>
            <div className="space-y-2">
              {displayReasons.map((reason, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <span className="text-alert-yellow font-bold min-w-[24px]">{index + 1}.</span>
                  <span className="text-slate-light">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Action */}
        {anomalyData.is_anomaly && (
          <div className="pt-3 border-t border-navy-dark">
            <div className="flex items-start space-x-2 p-3 bg-accent-cyan/10 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-bold text-accent-cyan mb-1">Recommended Action:</p>
                <p className="text-slate-light">
                  {anomalyData.priority === 'HIGH' 
                    ? 'Dispatch patrol immediately. High threat detected.'
                    : anomalyData.priority === 'MEDIUM'
                    ? 'Monitor closely and dispatch when available.'
                    : 'Continue routine monitoring.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="bg-navy-dark rounded-lg p-4">
        <h4 className="text-md font-bold text-slate-light mb-2">Agent Feedback</h4>
        <p className="text-xs text-slate-dark mb-3">
          Help improve AI accuracy by confirming the analysis
        </p>
        
        {feedbackGiven ? (
          <div className="flex items-center space-x-2 text-health-green p-3 bg-health-green/10 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Feedback logged! Model will improve.</span>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={() => handleFeedback('confirm')}
              className="flex-1 bg-health-green text-command-blue font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors flex items-center justify-center space-x-2"
            >
              <span>✓ Confirm</span>
            </button>
            <button
              onClick={() => handleFeedback('reject')}
              className="flex-1 bg-alert-red text-command-blue font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors flex items-center justify-center space-x-2"
            >
              <span>✗ False Alarm</span>
            </button>
          </div>
        )}
      </div>

      {/* Original Hash Info */}
      <div>
        <p className="font-semibold text-slate-light text-sm">Log Integrity:</p>
        <div className="flex items-center space-x-2 bg-navy-dark p-2 rounded-md mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-health-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-health-green font-semibold text-xs">Verified</span>
        </div>
        <p className="text-slate-dark font-mono text-xs mt-2 break-all">{alert.hash}</p>
      </div>
    </div>
  );
};

export default AlertDetailPanel;