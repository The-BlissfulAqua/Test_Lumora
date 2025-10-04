
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROLES } from '../constants';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const activeLinkClass = 'bg-accent-cyan text-command-blue';
  const inactiveLinkClass = 'text-slate-dark hover:bg-navy-dark hover:text-slate-light';

  return (
    <aside className={`bg-navy-light flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-navy-dark">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-cyan flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-slate-light ml-3 whitespace-nowrap">BorderSentinel</h1>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-grow px-2 py-4">
        {!isCollapsed && (
            <p className="px-4 py-2 text-xs font-semibold text-slate-dark uppercase tracking-wider">Views</p>
        )}
        <ul className="space-y-2">
          {ROLES.map(({ role, path, icon }) => (
            <li key={role}>
              <NavLink
                to={path}
                className={({ isActive }) => 
                  `w-full flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive ? activeLinkClass : inactiveLinkClass}`
                }
                title={role}
              >
                {icon}
                {!isCollapsed && <span className="ml-4">{role}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-navy-dark">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-dark hover:bg-navy-dark hover:text-slate-light transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-navy-dark text-center text-xs text-slate-dark">
        {!isCollapsed && <p>&copy; 2024 BorderSentinel</p>}
      </div>
    </aside>
  );
};

export default Sidebar;
