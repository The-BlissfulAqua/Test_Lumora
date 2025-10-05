import React from 'react';
import SystemHealthWidget from './SystemHealthWidget';
import { COMMAND_PATH } from '../constants';
import { useLocation } from 'react-router-dom';
import { ROLES } from '../constants';

const TopBar: React.FC = () => {
  const location = useLocation();
  const currentRole = ROLES.find(r => r.path === location.pathname)?.role;
  const title = currentRole ? `${currentRole} Dashboard` : 'Dashboard';

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-command-blue border-b border-navy-light">
      <h2 className="text-xl font-bold text-slate-light">{title}</h2>
  { !location.pathname.startsWith(COMMAND_PATH) && <SystemHealthWidget /> }
    </header>
  );
};

export default TopBar;
