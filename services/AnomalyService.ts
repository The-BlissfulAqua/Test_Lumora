/**
 * Simple Anomaly Detection Service (Mock Mode)
 * No backend needed - perfect for demos!
 */

import { Alert, AlertLevel } from '../types';

export interface AnomalyDetection {
  event_id: string;
  is_anomaly: boolean;
  confidence: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string[];
}

class AnomalyDetectionService {
  
  /**
   * Detect if an alert is an anomaly
   * This is a simplified mock version for demo
   */
  detectAnomaly(alert: Alert): AnomalyDetection {
    // Simple rules to determine if it's an anomaly
    const isNightTime = this.isNightTime(alert.timestamp);
    const isHighRisk = this.isHighRiskLocation(alert.coordinates.lat, alert.coordinates.lng);
    const isCritical = alert.level === 'Critical';
    
    // Calculate risk score
    let riskScore = 0;
    const reasons: string[] = [];
    
    if (isNightTime) {
      riskScore += 0.3;
      reasons.push('Activity during high-risk night hours (22:00-06:00)');
    }
    
    if (isHighRisk) {
      riskScore += 0.4;
      reasons.push('Located in known smuggling route (90% risk zone)');
    }
    
    if (isCritical) {
      riskScore += 0.2;
      reasons.push('Critical severity level detected');
    }
    
    // Check alert type
    if (alert.title.toLowerCase().includes('vehicle') || 
        alert.title.toLowerCase().includes('thermal')) {
      riskScore += 0.15;
      reasons.push('High-priority threat type detected');
    }
    
    // Determine if anomaly
    const isAnomaly = riskScore > 0.5;
    const confidence = Math.min(0.95, riskScore + 0.1);
    
    // Determine priority
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (confidence > 0.75) priority = 'HIGH';
    else if (confidence > 0.5) priority = 'MEDIUM';
    
    // Add default reason if none
    if (reasons.length === 0) {
      reasons.push('Normal activity pattern detected');
    }
    
    return {
      event_id: alert.id,
      is_anomaly: isAnomaly,
      confidence: confidence,
      priority: priority,
      explanation: reasons
    };
  }
  
  /**
   * Check if timestamp is during night (22:00 - 06:00)
   */
  private isNightTime(timestamp: string): boolean {
    const hour = parseInt(timestamp.split(' ')[1].split(':')[0]);
    return hour >= 22 || hour <= 6;
  }
  
  /**
   * Check if location is in high-risk zone
   */
  private isHighRiskLocation(lat: number, lng: number): boolean {
    // High-risk zones (from your dummy data)
    const highRiskZones = [
      { lat: 31.776, lng: -106.511, radius: 0.01 },
      { lat: 31.774, lng: -106.505, radius: 0.01 }
    ];
    
    for (const zone of highRiskZones) {
      const distance = Math.sqrt(
        Math.pow(lat - zone.lat, 2) + Math.pow(lng - zone.lng, 2)
      );
      if (distance < zone.radius) {
        return true;
      }
    }
    
    return false;
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
}

// Export singleton
export const AnomalyService = new AnomalyDetectionService();