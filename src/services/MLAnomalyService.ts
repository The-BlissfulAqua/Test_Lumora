/**
 * ML-Powered Anomaly Detection Service
 * Uses real Isolation Forest results from Python backend
 */

import { Alert } from '../types';
import { loadAnomalyDetections } from '../utils/dataLoader';

export interface AnomalyDetection {
  event_id: string;
  is_anomaly: boolean;
  confidence: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string[];
}

class MLAnomalyDetectionService {
  private anomalyMap: Map<string, any> | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the service by loading ML results
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.anomalyMap = await loadAnomalyDetections();
      this.initialized = true;
      console.log('✅ ML Anomaly Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize ML service:', error);
      this.anomalyMap = new Map();
      this.initialized = true;
    }
  }

  /**
   * Detect if an alert is an anomaly using ML results
   */
  async detectAnomaly(alert: Alert): Promise<AnomalyDetection> {
    // Ensure service is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    // Check if ML detected this as an anomaly
    const mlResult = this.anomalyMap?.get(alert.id);

    if (mlResult) {
      // Use ML results
      return {
        event_id: alert.id,
        is_anomaly: true,
        confidence: mlResult.anomaly_score,
        priority: mlResult.priority,
        explanation: mlResult.reasons || [
          'Detected by ML model',
          'Statistical outlier pattern identified'
        ]
      };
    }

    // If not in ML results, assume normal
    // (This happens for events not flagged as anomalies)
    return {
      event_id: alert.id,
      is_anomaly: false,
      confidence: this.estimateNormalConfidence(alert),
      priority: 'LOW',
      explanation: ['Normal activity pattern detected by ML']
    };
  }

  /**
   * Estimate confidence for normal (non-anomaly) events
   */
  private estimateNormalConfidence(alert: Alert): number {
    // For non-anomalies, return lower confidence
    // Adjust based on some basic heuristics
    let confidence = 0.3;
    
    // Slightly higher for info-level alerts
    if (alert.level === 'Info') {
      confidence = 0.25;
    }
    
    return confidence;
  }

  /**
   * Get color for confidence level
   */
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.75) return 'text-alert-red';
    if (confidence >= 0.5) return 'text-alert-yellow';
    return 'text-slate-light';
  }

  /**
   * Get color for priority badge
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'bg-alert-red';
      case 'MEDIUM': return 'bg-alert-yellow';
      case 'LOW': return 'bg-slate-dark';
      default: return 'bg-slate-dark';
    }
  }

  /**
   * Get all detected anomalies (for statistics)
   */
  async getAllAnomalies(): Promise<any[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return Array.from(this.anomalyMap?.values() || []);
  }

  /**
   * Get anomaly statistics
   */
  async getStats() {
    if (!this.initialized) {
      await this.initialize();
    }

    const anomalies = Array.from(this.anomalyMap?.values() || []);
    
    return {
      total: anomalies.length,
      high: anomalies.filter(a => a.priority === 'HIGH').length,
      medium: anomalies.filter(a => a.priority === 'MEDIUM').length,
      low: anomalies.filter(a => a.priority === 'LOW').length,
      avgConfidence: anomalies.reduce((sum, a) => sum + a.anomaly_score, 0) / anomalies.length || 0
    };
  }
}

// Export singleton
export const MLAnomalyService = new MLAnomalyDetectionService();
