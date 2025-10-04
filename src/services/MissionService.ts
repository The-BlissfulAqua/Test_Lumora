import { Alert, AlertStatus, ChatMessage, Evidence } from '../types';
import { loadSurveillanceData } from '../utils/dataLoader';

// In-memory alert storage
let alerts: Alert[] = [];
let isLoading = false;
let isInitialized = false;

// Listener system
type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

/**
 * Initialize and load surveillance data
 */
async function initializeAlerts() {
  if (isLoading || isInitialized) return;
  
  isLoading = true;
  console.log('🔄 Loading surveillance data...');
  
  try {
    const loadedAlerts = await loadSurveillanceData();
    
    if (loadedAlerts.length > 0) {
      alerts = loadedAlerts; // dataLoader already adds hash
      
      console.log(`✅ Loaded ${alerts.length} alerts from ML data source`);
      isInitialized = true;
      notifyListeners();
    } else {
      console.warn('⚠️ No data loaded from source.');
      alerts = [];
      isInitialized = true;
    }
  } catch (error) {
    console.error('❌ Failed to load alerts:', error);
    alerts = [];
    isInitialized = true;
  } finally {
    isLoading = false;
  }
}


export const MissionService = {
  /**
   * Subscribe to alert updates
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    
    // Initialize on first subscription
    if (!isInitialized && !isLoading) {
      initializeAlerts();
    }
    
    return () => listeners.delete(listener);
  },

  /**
   * Get all alerts
   */
  getAlerts(): Alert[] {
     if (!isInitialized && !isLoading) {
      initializeAlerts();
    }
    return [...alerts];
  },

  /**
   * Get single alert by ID
   */
  getAlert(id: string): Alert | undefined {
    return alerts.find(a => a.id === id);
  },

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(id: string): void {
    alerts = alerts.map(a => 
      a.id === id ? { ...a, status: AlertStatus.ACKNOWLEDGED } : a
    );
    notifyListeners();
  },

  /**
   * Add message to alert dispatch log
   */
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
  
  /**
   * Add evidence to alert
   */
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
  },
};
