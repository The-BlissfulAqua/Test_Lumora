
import React from 'react';
import { Alert, AlertLevel } from '../types';

interface IncidentCardProps {
  alert: Alert;
  isSelected: boolean;
  onSelect?: (alertId: string, isSelected: boolean) => void;
  onViewOnTimeline?: (alert: Alert) => void;
  onClick?: (alert: Alert) => void;
  showCheckbox?: boolean;
  showTimelineButton?: boolean;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ 
    alert, 
    isSelected, 
    onSelect, 
    onViewOnTimeline,
    onClick,
    showCheckbox = true,
    showTimelineButton = true
}) => {
  const levelColorMap = {
    [AlertLevel.CRITICAL]: 'border-alert-red',
    [AlertLevel.WARNING]: 'border-alert-yellow',
    [AlertLevel.INFO]: 'border-slate-dark',
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(alert.id, e.target.checked);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement || (e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(alert);
  };
  
  const cardClasses = `
    p-3 rounded-lg shadow-md border-l-4 ${levelColorMap[alert.level]} 
    bg-navy-dark transition-all duration-200
    ${isSelected ? 'ring-2 ring-accent-cyan' : ''}
    ${onClick ? 'cursor-pointer hover:bg-opacity-80' : ''}
  `;

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      <div className="flex items-start justify-between">
        <div className="flex-grow">
            <h4 className="font-bold text-slate-light">{alert.title}</h4>
            <p className="text-xs text-slate-dark">{alert.timestamp}</p>
        </div>
        {showCheckbox && (
            <input 
                type="checkbox"
                checked={isSelected}
                onChange={handleCheckboxChange}
                className="ml-4 h-5 w-5 rounded bg-command-blue border-slate-dark text-accent-cyan focus:ring-accent-cyan cursor-pointer flex-shrink-0"
                aria-label={`Select incident for analysis: ${alert.title}`}
            />
        )}
      </div>
      {showTimelineButton && (
        <button 
            onClick={() => onViewOnTimeline?.(alert)} 
            className="mt-2 text-xs text-accent-cyan hover:underline"
            aria-label={`View ${alert.title} on timeline`}
        >
            View on Timeline
        </button>
      )}
    </div>
  );
};

export default IncidentCard;
