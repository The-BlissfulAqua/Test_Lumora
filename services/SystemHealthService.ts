import { SystemStatus } from '../types';

type Listener = (statusMap: Record<string, SystemStatus>) => void;

// Initialize with defaults similar to constants
const defaultStatus: Record<string, SystemStatus> = {
  'AI Engine': SystemStatus.OPERATIONAL,
  'Sensors': SystemStatus.OPERATIONAL,
  'Data Pipeline': SystemStatus.OPERATIONAL,
  'Network': SystemStatus.OPERATIONAL,
};

let statusMap = { ...defaultStatus };
const listeners = new Set<Listener>();

export const SystemHealthService = {
  subscribe(cb: Listener) {
    listeners.add(cb);
    // immediately notify
    cb({ ...statusMap });
    return () => { listeners.delete(cb); };
  },

  getStatus() {
    return { ...statusMap };
  },

  setStatus(newMap: Record<string, SystemStatus>) {
    statusMap = { ...newMap };
    listeners.forEach(l => l({ ...statusMap }));
  },

  // Randomize statuses (used during demo)
  randomize() {
    const choices = Object.values(SystemStatus);
    const keys = Object.keys(statusMap);
    const newMap: Record<string, SystemStatus> = {};
    keys.forEach(k => {
      newMap[k] = choices[Math.floor(Math.random() * choices.length)];
    });
    this.setStatus(newMap);
  },

  reset() {
    this.setStatus(defaultStatus);
  }
};
