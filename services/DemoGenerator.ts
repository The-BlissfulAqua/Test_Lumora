import { Alert, AlertLevel, AlertStatus, ChatMessage, Evidence } from '../types';
import { INDIA_BORDER_VERTICES } from '../data/india_border_vertices';

// Simple seeded-ish random helper
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Coordinates around India's borders (approx). We'll jitter them slightly.
const BORDER_ANCHORS = [
  { lat: 34.1526, lng: 77.5778 }, // north (Jammu)
  { lat: 27.1767, lng: 78.0081 }, // central north
  { lat: 21.1458, lng: 79.0882 }, // east-central
  { lat: 20.5937, lng: 78.9629 }, // central
  { lat: 15.2993, lng: 74.1240 }, // west coast
  { lat: 8.5241, lng: 76.9366 },  // south
  { lat: 22.5726, lng: 88.3639 }, // east (Kolkata)
];

const SAMPLE_TITLES = [
  'Unusual vehicle crossing detected',
  'Sensor anomaly: thermal spike',
  'Unauthorized border activity',
  'Loitering near checkpoint',
  'Drone activity detected',
  'Communications blackspot anomaly',
];

const SAMPLE_REASONS = [
  'High thermal signature differing from baseline',
  'Movement pattern consistent with known smuggling routes',
  'Unexpected transponder behavior',
  'Multiple sensor corroboration across modalities',
  'Time-of-day mismatch for local traffic',
  'Repeated beacon pings from unregistered device',
];

export function generateDemoAlerts(count = 6): Alert[] {
  const alerts: Alert[] = [];

  for (let i = 0; i < count; i++) {
    const anchor = BORDER_ANCHORS[i % BORDER_ANCHORS.length];
    const jitterLat = (Math.random() - 0.5) * 0.6; // ~±0.3 deg
    const jitterLng = (Math.random() - 0.5) * 0.6;
    const lat = +(anchor.lat + jitterLat).toFixed(5);
    const lng = +(anchor.lng + jitterLng).toFixed(5);

    // Snap to nearest border vertex for realism
    let snapped = { lat, lng };
    try {
      let best = INDIA_BORDER_VERTICES[0];
      let bestDist = Math.hypot(lat - best.lat, lng - best.lng);
      for (let v of INDIA_BORDER_VERTICES) {
        const d = Math.hypot(lat - v.lat, lng - v.lng);
        if (d < bestDist) { bestDist = d; best = v; }
      }
      // apply a tiny jitter towards the border vertex (not exact overwrite)
      const jitterFactor = 0.04; // keeps points near vertex but not identical
      snapped = {
        lat: +(lat * (1 - jitterFactor) + best.lat * jitterFactor).toFixed(5),
        lng: +(lng * (1 - jitterFactor) + best.lng * jitterFactor).toFixed(5),
      };
    } catch (e) {
      // fall back to original jittered point
    }

    const level = i % 3 === 0 ? AlertLevel.CRITICAL : i % 3 === 1 ? AlertLevel.WARNING : AlertLevel.INFO;

    const now = new Date(Date.now() - randInt(0, 60 * 60 * 1000)).toUTCString();

    const alert: Alert = {
      id: `demo-${Date.now()}-${i}`,
      title: SAMPLE_TITLES[i % SAMPLE_TITLES.length],
      description: SAMPLE_REASONS[i % SAMPLE_REASONS.length],
      timestamp: now,
      location: `Border sector ${i + 1}`,
  coordinates: { lat: snapped.lat, lng: snapped.lng },
      level,
      status: AlertStatus.PENDING,
      dispatchLog: generateDispatchLog(),
      evidence: generateEvidenceList(),
      threatSource: `anchor-${i % BORDER_ANCHORS.length}`,
      hash: '', // MissionService will compute
    } as Alert;

    alerts.push(alert);
  }

  return alerts;
}

function generateDispatchLog(): ChatMessage[] {
  const msgs: ChatMessage[] = [];
  const count = randInt(1, 3);
  for (let i = 0; i < count; i++) {
    msgs.push({
      id: `msg-${Date.now()}-${i}`,
      sender: i === 0 ? 'Command' : 'Agent',
      text: i === 0 ? 'Automated detection: confidence high' : 'Acknowledged. Monitoring',
      timestamp: new Date(Date.now() - randInt(1000, 60000)).toUTCString(),
    });
  }
  return msgs;
}

function generateEvidenceList(): Evidence[] {
  const ev: Evidence[] = [];
  const count = randInt(0, 2);
  for (let i = 0; i < count; i++) {
    ev.push({
      id: `ev-${Date.now()}-${i}`,
      fileName: `evidence_${i + 1}.jpg`,
      hash: `hash-${Math.floor(Math.random() * 100000)}`,
      timestamp: new Date(Date.now() - randInt(1000, 60000)).toUTCString(),
    });
  }
  return ev;
}
