// Soldier and Equipment Types
export interface Soldier {
  metadata: {
    fullName: string;
    personalNumber: string;
    phoneNumber: string;
  };
  // Assignment data (what equipment they should have)
  assignedAssets: Assets;
}

export interface Assets {
  personalWeaponNumber?: string;
  personalSightsNumber?: string;
  nightVisionNumber?: string;
  binocularsNumber?: string;
  hasCompass?: boolean;
  actiq?: number;
  morphine?: number;
  midazolam?: number;
  ketamine50mg?: number;
  ketamine10mg?: number;
}

// Daily report data (what they actually reported)
export interface DailyReport {
  metadata: {
    timestamp: string;
    personalNumber: string;
  };

  // From DailyReport
  values: Assets;
}

// ✅ Fixed version:
export interface SoldierReportRow {
  // From Soldier
  metadata: {
    fullName: string;
    personalNumber: string;
    phoneNumber: string;
  };

  // From Soldier
  assignedAssets: Assets;

  // From DailyReport
  reportedAssets: Assets;

  // Status indicators
  anomalies: AnomalyType[];
  fieldAnomalies: Record<string, FieldAnomaly>;
  hasReport: boolean;
}

export type AnomalyType =
  | "missing_required"
  | "unexpected_item"
  | "excess_quantity"
  | "invalid_value"
  | "no_report";

export interface FieldAnomaly {
  type: AnomalyType;
  message: string;
}
