import React from 'react';
import { SYSTEM_HEALTH_STATUS } from '../constants';
import { SystemStatus } from '../types';

const SystemHealthWidget: React.FC = () => {
  const statusColorMap = {
    [SystemStatus.OPERATIONAL]: 'bg-health-green',
    [SystemStatus.DEGRADED]: 'bg-alert-yellow',
    [SystemStatus.OFFLINE]: 'bg-alert-red',
  };

  return (
    <div className="flex items-center space-x-4 bg-navy-light px-4 py-2 rounded-lg">
      <h3 className="text-sm font-semibold text-slate-light hidden md:block">System Health</h3>
      {SYSTEM_HEALTH_STATUS.map(({ name, status }) => (
        <div key={name} className="flex items-center space-x-2" title={status}>
          <span className={`h-3 w-3 rounded-full ${statusColorMap[status]}`}></span>
          <span className="text-sm text-slate-dark hidden lg:block">{name}</span>
        </div>
      ))}
    </div>
  );
};

export default SystemHealthWidget;
