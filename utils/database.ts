import { ScanHistoryItem, RiskLevel } from "../types";

const DB_KEY = 'veripay_history_v1';
const ONBOARDING_KEY = 'veripay_onboarding_v1';
const PREFS_KEY = 'veripay_prefs_v1';

const SEED_DATA: ScanHistoryItem[] = [
  {
    id: 'seed-1',
    riskLevel: RiskLevel.SAFE,
    trustScore: 98,
    recipientName: "Official Starbucks Corp",
    recipientId: "merchant.starbucks@bank",
    flags: ["Verified Merchant", "High Transaction Volume", "Official Domain"],
    reasoning: "This is a verified merchant ID associated with a known global brand. Pattern matches official banking records.",
    timestamp: Date.now() - 86400000 // 1 day ago
  },
  {
    id: 'seed-2',
    riskLevel: RiskLevel.HIGH_RISK,
    trustScore: 12,
    recipientName: "Unknown Wallet",
    recipientId: "0x3f...a92b",
    flags: ["New Wallet", "Reported in Scam DB", "Suspicious Pattern"],
    reasoning: "This address has been flagged in multiple community reports for phishing scams. Do not transfer funds.",
    timestamp: Date.now() - 172800000 // 2 days ago
  }
];

export const db = {
  init: () => {
    if (!localStorage.getItem(DB_KEY)) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    }
  },

  getAll: (): ScanHistoryItem[] => {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Database read error", e);
      return [];
    }
  },

  add: (item: Omit<ScanHistoryItem, 'id'>): ScanHistoryItem => {
    const history = db.getAll();
    const newItem: ScanHistoryItem = {
      ...item,
      id: crypto.randomUUID()
    };
    // Add to beginning of list
    const updatedHistory = [newItem, ...history];
    localStorage.setItem(DB_KEY, JSON.stringify(updatedHistory));
    return newItem;
  },

  clear: () => {
    localStorage.removeItem(DB_KEY);
  },

  getStats: () => {
    const history = db.getAll();
    const safeCount = history.filter(i => i.riskLevel === 'SAFE').length;
    const riskyCount = history.filter(i => i.riskLevel === 'HIGH_RISK').length;
    const cautionCount = history.filter(i => i.riskLevel === 'CAUTION').length;
    return { total: history.length, safe: safeCount, risky: riskyCount, caution: cautionCount };
  },

  isOnboardingComplete: (): boolean => {
    return !!localStorage.getItem(ONBOARDING_KEY);
  },

  completeOnboarding: () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  },

  getPreferences: () => {
    try {
      const data = localStorage.getItem(PREFS_KEY);
      return data ? JSON.parse(data) : { biometricEnabled: false };
    } catch {
      return { biometricEnabled: false };
    }
  },

  setPreference: (key: string, value: any) => {
    const prefs = db.getPreferences();
    prefs[key] = value;
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }
};