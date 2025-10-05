import { DUMMY_ALERTS } from '../constants';
import { Alert, AlertStatus, ChatMessage, Evidence } from '../types';
import { generateHash } from '../utils/crypto';

// This is a simple in-memory store. In a real app, this would be a state management library like Zustand or Redux.
let alerts: Alert[] = DUMMY_ALERTS.map(alert => {
  const dataToHash = `${alert.id}-${alert.timestamp}-${alert.location}`;
  return { ...alert, hash: generateHash(dataToHash) };
});

// A simple listener system to notify components of changes.
type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const MissionService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener); // Unsubscribe function
  },

  getAlerts(): Alert[] {
    return [...alerts];
  },

  getAlert(id: string): Alert | undefined {
    return alerts.find(a => a.id === id);
  },

  acknowledgeAlert(id: string): void {
    alerts = alerts.map(a => 
      a.id === id ? { ...a, status: AlertStatus.ACKNOWLEDGED } : a
    );
    notifyListeners();
  },

  addMessage(alertId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    alerts = alerts.map(a => {
      if (a.id === alertId) {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date().toUTCString(),
        };
        return { ...a, dispatchLog: [...a.dispatchLog, newMessage] };
      }
      return a;
    });
    notifyListeners();
  },
  
  addEvidence(alertId: string, evidence: Omit<Evidence, 'id' | 'timestamp'>): void {
    alerts = alerts.map(a => {
      if (a.id === alertId) {
        const newEvidence: Evidence = {
          ...evidence,
          id: `ev-${Date.now()}`,
          timestamp: new Date().toUTCString(),
        };
        return { ...a, evidence: [...a.evidence, newEvidence] };
      }
      return a;
    });
    notifyListeners();
  }
  ,

  // Replace current alerts with a new set. Useful for demo seeding.
  setAlerts(newAlerts: Alert[]): void {
    // Recompute hashes for each alert
    alerts = newAlerts.map(alert => {
      const dataToHash = `${alert.id}-${alert.timestamp}-${alert.location}`;
      return { ...alert, hash: generateHash(dataToHash) };
    });
    notifyListeners();
  },

  // Append a single alert
  addAlert(alert: Alert): void {
    const dataToHash = `${alert.id}-${alert.timestamp}-${alert.location}`;
    const withHash = { ...alert, hash: generateHash(dataToHash) };
    alerts = [withHash, ...alerts];
    notifyListeners();
  },

  // Clear all alerts
  clearAlerts(): void {
    alerts = [];
    notifyListeners();
  }
};
