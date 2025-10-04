import { UserRole, SystemStatus } from './types';
import type { RoleConfig, SystemComponentHealth } from './types';

export const COMMAND_PATH = '/command';
export const FIELD_AGENT_PATH = '/agent';
export const ANALYST_PATH = '/analyst';

export const ROLES: RoleConfig[] = [
  { role: UserRole.COMMAND, path: COMMAND_PATH },
  { role: UserRole.FIELD_AGENT, path: FIELD_AGENT_PATH },
  { role: UserRole.ANALYST, path: ANALYST_PATH },
];

export const SYSTEM_HEALTH_STATUS: SystemComponentHealth[] = [
    { name: 'AI Core', status: SystemStatus.OPERATIONAL },
    { name: 'Sensors', status: SystemStatus.DEGRADED },
    { name: 'Network', status: SystemStatus.OPERATIONAL },
    { name: 'Drones', status: SystemStatus.OPERATIONAL },
];
