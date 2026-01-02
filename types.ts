export enum RiskLevel {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  HIGH_RISK = 'HIGH_RISK',
  UNKNOWN = 'UNKNOWN'
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  trustScore: number; // 0 to 100
  recipientName: string;
  recipientId: string; // The phone number or QR content
  flags: string[];
  reasoning: string;
  timestamp: number;
}

export interface ScanHistoryItem extends AnalysisResult {
  id: string;
}

export enum AppView {
  HOME = 'HOME',
  SCAN = 'SCAN',
  MANUAL = 'MANUAL',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
  ALERTS = 'ALERTS',
  PAYMENT = 'PAYMENT',
  PROFILE = 'PROFILE',
  ONBOARDING = 'ONBOARDING'
}