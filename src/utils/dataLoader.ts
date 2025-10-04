/**
 * Data Loader - Loads ML-generated surveillance data
 */

import { Alert, AlertLevel, AlertStatus } from '../types';
import { generateHash } from './crypto';

// Cache loaded data
let cachedAlerts: Alert[] | null = null;
let cachedAnomalies: any[] | null = null;

/**
 * Load surveillance events from JSON
 */
export async function loadSurveillanceData(): Promise<Alert[]> {
  if (cachedAlerts) return cachedAlerts;

  try {
    // Fetch the ML-generated events
    const response = await fetch('./data/border_surveillance_data.json');
    if (!response.ok) {
      throw new Error(`Failed to load surveillance data: ${response.statusText}`);
    }
    
    const events = await response.json();
    
    // Convert to Alert format
    cachedAlerts = events.map((event: any) => {
      // Determine alert level based on priority
      let level: AlertLevel;
      switch (event.priority) {
        case 'HIGH':
          level = AlertLevel.CRITICAL;
          break;
        case 'MEDIUM':
          level = AlertLevel.WARNING;
          break;
        case 'LOW':
        default:
          level = AlertLevel.INFO;
          break;
      }

      // Format title based on event type
      const titleMap: Record<string, string> = {
        'thermal_signature': 'Thermal Signature Detected',
        'drone_detection': 'Unidentified Drone Activity',
        'camera_alert': 'Camera Motion Alert',
        'motion_sensor': 'Motion Sensor Triggered',
        'seismic_activity': 'Seismic Activity Detected'
      };

      const title = titleMap[event.event_type] || 'Unknown Event';

      // Create alert object
      const alert: Alert = {
        id: event.event_id,
        level: level,
        title: title,
        timestamp: event.timestamp,
        location: `Sector ${Math.floor(event.latitude * 10) % 9 + 1}, Grid ${String.fromCharCode(65 + Math.floor(event.longitude * 10) % 8)}`,
        coordinates: {
          lat: event.latitude,
          lng: event.longitude
        },
        status: AlertStatus.PENDING,
        dispatchLog: [],
        evidence: [],
        hash: generateHash(`${event.event_id}-${event.timestamp}-${event.latitude}`)
      };

      return alert;
    });

    console.log(`✅ Loaded and created ${cachedAlerts.length} alerts from surveillance data`);
    return cachedAlerts;
    
  } catch (error) {
    console.error('❌ Failed to load surveillance data:', error);
    // Return empty array instead of crashing
    return [];
  }
}

/**
 * Load ML anomaly detection results
 */
export async function loadAnomalyDetections(): Promise<Map<string, any>> {
  if (cachedAnomalies) {
    return new Map(cachedAnomalies.map(a => [a.event_id, a]));
  }

  try {
    const response = await fetch('./data/detected_anomalies.json');
    if (!response.ok) {
      throw new Error(`Failed to load anomaly data: ${response.statusText}`);
    }
    
    cachedAnomalies = await response.json();
    console.log(`✅ Loaded ${cachedAnomalies.length} ML anomaly detections`);
    
    return new Map(cachedAnomalies.map(a => [a.event_id, a]));
    
  } catch (error) {
    console.error('❌ Failed to load anomaly data:', error);
    return new Map();
  }
}

/**
 * Get statistics about loaded data
 */
export function getDataStats() {
  return {
    totalAlerts: cachedAlerts?.length || 0,
    totalAnomalies: cachedAnomalies?.length || 0,
    isLoaded: cachedAlerts !== null && cachedAnomalies !== null
  };
}
