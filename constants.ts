
import React from 'react';
import { UserRole, AlertLevel, SystemStatus, AlertStatus } from './types';
import type { RoleConfig, Alert, SystemComponentHealth } from './types';

export const COMMAND_PATH = '/command';
export const FIELD_AGENT_PATH = '/agent';
export const ANALYST_PATH = '/analyst';

export const ROLES: RoleConfig[] = [
  { 
    role: UserRole.COMMAND, 
    path: COMMAND_PATH,
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file
    icon: (
      React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 17v-2a4 4 0 00-4-4H3V9a4 4 0 004-4V3m12 14v-2a4 4 0 00-4-4h-2V9a4 4 0 004-4V3" })
      )
    )
  },
  { 
    role: UserRole.FIELD_AGENT, 
    path: FIELD_AGENT_PATH,
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file
    icon: (
      React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197M15 21a3 3 0 003-3V6a3 3 0 00-3-3H9a3 3 0 00-3 3v12a3 3 0 003 3h6z" })
      )
    )
  },
  { 
    role: UserRole.ANALYST, 
    path: ANALYST_PATH,
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file
    icon: (
       React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
      )
    )
  },
];

export const DUMMY_ALERTS: Alert[] = [
  {
    id: 'a1',
    level: AlertLevel.CRITICAL,
    title: 'Unidentified Vehicle Detected',
    timestamp: '2024-07-31 22:15:03 UTC',
    location: 'Sector 4, Grid 8B',
    coordinates: { lat: 31.776, lng: -106.511 },
    status: AlertStatus.PENDING,
    dispatchLog: [
        { id: 'msg1', sender: 'Command', text: 'Agent 7, investigate unidentified vehicle at Sector 4. High priority.', timestamp: '2024-07-31 22:15:10 UTC' }
    ],
    evidence: [],
  },
  {
    id: 'a2',
    level: AlertLevel.WARNING,
    title: 'Perimeter Sensor Anomaly',
    timestamp: '2024-07-31 22:12:45 UTC',
    location: 'Gate 3',
    coordinates: { lat: 31.774, lng: -106.505 },
    status: AlertStatus.ACKNOWLEDGED,
    dispatchLog: [
        { id: 'msg2', sender: 'Command', text: 'Check perimeter sensor at Gate 3.', timestamp: '2024-07-31 22:12:55 UTC' },
        { id: 'msg3', sender: 'Agent', text: 'Acknowledged. On my way.', timestamp: '2024-07-31 22:13:20 UTC' },
    ],
    evidence: [],
  },
  {
    id: 'a3',
    level: AlertLevel.WARNING,
    title: 'Low Drone Battery',
    timestamp: '2024-07-31 22:10:11 UTC',
    location: 'Drone Unit AX-7',
    coordinates: { lat: 31.78, lng: -106.52 },
    status: AlertStatus.RESOLVED,
    dispatchLog: [],
    evidence: [],
  },
  {
    id: 'a4',
    level: AlertLevel.INFO,
    title: 'Scheduled Maintenance',
    timestamp: '2024-07-31 22:05:00 UTC',
    location: 'Command Center',
    coordinates: { lat: 31.77, lng: -106.49 },
    status: AlertStatus.RESOLVED,
    dispatchLog: [],
    evidence: [],
  },
];

export const SYSTEM_HEALTH_STATUS: SystemComponentHealth[] = [
    { name: 'AI Core', status: SystemStatus.OPERATIONAL },
    { name: 'Sensors', status: SystemStatus.DEGRADED },
    { name: 'Network', status: SystemStatus.OPERATIONAL },
    { name: 'Drones', status: SystemStatus.OPERATIONAL },
];
