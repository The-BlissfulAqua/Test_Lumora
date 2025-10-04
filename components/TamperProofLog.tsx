import React from 'react';
import { Alert } from '../types';

interface TamperProofLogProps {
  alerts: Alert[];
}

const TamperProofLog: React.FC<TamperProofLogProps> = ({ alerts }) => {
  return (
    <div className="bg-navy-light rounded-2xl shadow-lg p-6 flex flex-col">
      <h3 className="text-xl font-bold text-accent-cyan mb-4 flex-shrink-0">Tamper-Proof Event Log</h3>
      <div className="overflow-y-auto pr-2 flex-grow">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-dark uppercase">
            <tr>
              <th scope="col" className="py-2 pr-2">Timestamp</th>
              <th scope="col" className="py-2 pr-2">Event</th>
              <th scope="col" className="py-2 pr-2">Hash</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => (
              <tr key={alert.id} className="border-b border-navy-dark hover:bg-navy-dark">
                <td className="py-2 pr-2 text-slate-dark whitespace-nowrap">{alert.timestamp}</td>
                <td className="py-2 pr-2 text-slate-light">{alert.title}</td>
                <td className="py-2 pr-2 text-slate-dark font-mono text-xs">{alert.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TamperProofLog;
