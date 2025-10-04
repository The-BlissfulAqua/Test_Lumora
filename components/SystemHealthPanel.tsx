import React from 'react';
import { SYSTEM_HEALTH_STATUS } from '../constants';
import { SystemStatus } from '../types';

const SystemHealthPanel: React.FC = () => {
    const statusColorMap = {
        [SystemStatus.OPERATIONAL]: 'text-health-green',
        [SystemStatus.DEGRADED]: 'text-alert-yellow',
        [SystemStatus.OFFLINE]: 'text-alert-red',
    };
    const statusDotMap = {
        [SystemStatus.OPERATIONAL]: 'bg-health-green',
        [SystemStatus.DEGRADED]: 'bg-alert-yellow',
        [SystemStatus.OFFLINE]: 'bg-alert-red',
    };

  return (
    <div className="bg-navy-light rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-accent-cyan mb-4">System Health</h3>
      <ul className="space-y-3">
        {SYSTEM_HEALTH_STATUS.map(({ name, status }) => (
          <li key={name} className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-3">
                <span className={`h-2.5 w-2.5 rounded-full ${statusDotMap[status]}`}></span>
                <span className="text-slate-light">{name}</span>
            </div>
            <span className={`font-semibold ${statusColorMap[status]}`}>{status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemHealthPanel;
