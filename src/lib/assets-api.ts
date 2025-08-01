import type {
  Assets,
  Soldier,
  DailyReport,
  SoldierReportRow,
  AnomalyType,
  FieldAnomaly,
} from "./types";
import { apiClient } from "./api-client";

type ColumnName =
  | keyof Assets
  | "fullName"
  | "personalNumber"
  | "phoneNumber"
  | "timestamp";

/**
 * Create a mapping from column headers to their indexes
 */
function createColumnMapping(headers: any[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  headers.forEach((header, index) => {
    if (header && typeof header === "string") {
      // Normalize header names (trim whitespace, convert to lowercase)
      const normalizedHeader = header.toString().trim().toLowerCase();
      mapping[normalizedHeader] = index;
    }
  });
  return mapping;
}

/**
 * Safely get value from row using column mapping
 */
function getColumnValue(
  row: any[],
  columnMapping: Record<string, number>,
  columnName: ColumnName
): any {
  const index = columnMapping[columnName.toLowerCase()];
  return index !== undefined ? row[index] : undefined;
}

/**
 * Transform raw Google Sheets data to Soldier objects
 * Headers: fullName, personalNumber, personalWeaponNumber, personalSightsNumber, nightVisionNumber, binocularsNumber, hasCompass, actiq, morphine, midazolam, ketamine50mg, ketamine10mg
 */
function transformSheetDataToSoldiers(rawData: any[][]): Soldier[] {
  if (!rawData || rawData.length < 2) {
    console.warn("No soldiers data or insufficient data");
    return [];
  }

  // First row should be headers, skip it
  const headers = rawData[0];
  const dataRows = rawData.slice(1);
  const columnMapping = createColumnMapping(headers);

  return dataRows
    .filter((row) => {
      // Filter out empty rows (need at least name and personal number)
      const fullName = getColumnValue(row, columnMapping, "fullName");
      const personalNumber = getColumnValue(
        row,
        columnMapping,
        "personalNumber"
      );
      return fullName && personalNumber;
    })
    .map((row, index) => {
      try {
        const soldier: Soldier = {
          metadata: {
            fullName: String(
              getColumnValue(row, columnMapping, "fullName") || ""
            ),
            personalNumber: String(
              getColumnValue(row, columnMapping, "personalNumber") || ""
            ),
            phoneNumber: String(
              getColumnValue(row, columnMapping, "phoneNumber") || ""
            ),
          },
          assignedAssets: {
            personalWeaponNumber:
              getColumnValue(row, columnMapping, "personalWeaponNumber") &&
              String(
                getColumnValue(row, columnMapping, "personalWeaponNumber")
              ).trim() !== "0"
                ? String(
                    getColumnValue(row, columnMapping, "personalWeaponNumber")
                  )
                : undefined,
            personalSightsNumber:
              getColumnValue(row, columnMapping, "personalSightsNumber") &&
              String(
                getColumnValue(row, columnMapping, "personalSightsNumber")
              ).trim() !== "0"
                ? String(
                    getColumnValue(row, columnMapping, "personalSightsNumber")
                  )
                : undefined,
            nightVisionNumber:
              getColumnValue(row, columnMapping, "nightVisionNumber") &&
              String(
                getColumnValue(row, columnMapping, "nightVisionNumber")
              ).trim() !== "0"
                ? String(
                    getColumnValue(row, columnMapping, "nightVisionNumber")
                  )
                : undefined,
            binocularsNumber:
              getColumnValue(row, columnMapping, "binocularsNumber") &&
              String(
                getColumnValue(row, columnMapping, "binocularsNumber")
              ).trim() !== "0"
                ? String(getColumnValue(row, columnMapping, "binocularsNumber"))
                : undefined,
            hasCompass: (() => {
              const rawValue = getColumnValue(row, columnMapping, "hasCompass");
              const stringValue = String(rawValue).trim();
              const parsedValue =
                rawValue &&
                (stringValue.toUpperCase() === "TRUE" || stringValue === "יש");
              return parsedValue;
            })(),
            actiq: Number(getColumnValue(row, columnMapping, "actiq")) || 0,
            morphine:
              Number(getColumnValue(row, columnMapping, "morphine")) || 0,
            midazolam:
              Number(getColumnValue(row, columnMapping, "midazolam")) || 0,
            ketamine50mg:
              Number(getColumnValue(row, columnMapping, "ketamine50mg")) || 0,
            ketamine10mg:
              Number(getColumnValue(row, columnMapping, "ketamine10mg")) || 0,
          },
        };
        return soldier;
      } catch (error) {
        console.error(`Error transforming soldier row ${index}:`, row, error);
        throw error;
      }
    });
}

/**
 * Transform raw Google Sheets data to DailyReport objects
 * Expected sheet columns: timestamp, personalNumber, personalWeaponNumber, personalSightsNumber, nightVisionNumber, binocularsNumber, hasCompass, actiq, morphine, midazolam, ketamine50mg, ketamine10mg, submissionTime
 */
function transformSheetDataToReports(rawData: any[][]): DailyReport[] {
  if (!rawData || rawData.length < 1) {
    console.warn("No reports data");
    return [];
  }

  // Check if we have headers
  const hasHeaders = rawData.length > 1;
  const headers = hasHeaders ? rawData[0] : null;
  const dataRows = hasHeaders ? rawData.slice(1) : rawData;
  const columnMapping = headers ? createColumnMapping(headers) : {};

  return dataRows
    .filter((row) => {
      // Filter out empty rows (need at least personal number)
      if (!row || row.length === 0) return false;
      if (headers) {
        const personalNumber = getColumnValue(
          row,
          columnMapping,
          "personalNumber"
        );
        return personalNumber;
      } else {
        return row[1]; // Fallback to index 1 if no headers
      }
    })
    .map((row, index) => {
      try {
        const report: DailyReport = {
          metadata: {
            timestamp: String(
              getColumnValue(row, columnMapping, "timestamp") || ""
            ),
            personalNumber: String(
              getColumnValue(row, columnMapping, "personalNumber") || ""
            ),
          },
          values: {
            personalWeaponNumber: getColumnValue(
              row,
              columnMapping,
              "personalWeaponNumber"
            )
              ? String(
                  getColumnValue(row, columnMapping, "personalWeaponNumber")
                )
              : undefined,
            personalSightsNumber: getColumnValue(
              row,
              columnMapping,
              "personalSightsNumber"
            )
              ? String(
                  getColumnValue(row, columnMapping, "personalSightsNumber")
                )
              : undefined,
            nightVisionNumber: getColumnValue(
              row,
              columnMapping,
              "nightVisionNumber"
            )
              ? String(getColumnValue(row, columnMapping, "nightVisionNumber"))
              : undefined,
            binocularsNumber: getColumnValue(
              row,
              columnMapping,
              "binocularsNumber"
            )
              ? String(getColumnValue(row, columnMapping, "binocularsNumber"))
              : undefined,
            hasCompass: (() => {
              const rawValue = getColumnValue(row, columnMapping, "hasCompass");
              const stringValue = String(rawValue).trim();
              const parsedValue =
                rawValue &&
                (stringValue.toUpperCase() === "TRUE" || stringValue === "יש");
              return parsedValue;
            })(),
            actiq: getColumnValue(row, columnMapping, "actiq")
              ? Number(getColumnValue(row, columnMapping, "actiq"))
              : undefined,
            morphine: getColumnValue(row, columnMapping, "morphine")
              ? Number(getColumnValue(row, columnMapping, "morphine"))
              : undefined,
            midazolam: getColumnValue(row, columnMapping, "midazolam")
              ? Number(getColumnValue(row, columnMapping, "midazolam"))
              : undefined,
            ketamine50mg: getColumnValue(row, columnMapping, "ketamine50mg")
              ? Number(getColumnValue(row, columnMapping, "ketamine50mg"))
              : undefined,
            ketamine10mg: getColumnValue(row, columnMapping, "ketamine10mg")
              ? Number(getColumnValue(row, columnMapping, "ketamine10mg"))
              : undefined,
          },
        };

        return report;
      } catch (error) {
        console.error(`Error transforming report row ${index}:`, row, error);
        throw error;
      }
    });
}

/**
 * אחזור כל הלוחמים מהשרת
 */
export async function fetchSoldiers(): Promise<Soldier[]> {
  try {
    const response = await apiClient.get("/soldiers");

    // Transform raw Google Sheets data to structured objects
    const soldiers = transformSheetDataToSoldiers(response.data);

    return soldiers;
  } catch (error) {
    console.error("נכשל באחזור לוחמים:", error);
    throw error;
  }
}

/**
 * אחזור דיווחים יומיים לתאריך מסוים
 */
export async function fetchDailyReports(date: string): Promise<DailyReport[]> {
  try {
    const response = await apiClient.get("/reports/daily");

    // Transform raw Google Sheets data to structured objects
    const allReports = transformSheetDataToReports(response.data);

    // Filter reports by the selected date
    const targetDate = new Date(date);
    const filteredReports = allReports.filter((report) => {
      if (!report.metadata.timestamp) return false;

      // Parse the timestamp and compare dates
      const reportDate = new Date(report.metadata.timestamp);

      // Compare year, month, and day only (ignore time)
      return (
        reportDate.getFullYear() === targetDate.getFullYear() &&
        reportDate.getMonth() === targetDate.getMonth() &&
        reportDate.getDate() === targetDate.getDate()
      );
    });

    return filteredReports;
  } catch (error) {
    console.error("נכשל באחזור דיווחים יומיים:", error);
    throw error;
  }
}

/**
 * זיהוי חריגות בדיווח צל״מ
 */
function detectAnomalies(
  soldier: Soldier,
  report?: DailyReport
): { anomalies: AnomalyType[]; fieldAnomalies: Record<string, FieldAnomaly> } {
  const anomalies: AnomalyType[] = [];
  const fieldAnomalies: Record<string, FieldAnomaly> = {};

  if (!report) {
    anomalies.push("no_report");
    return { anomalies, fieldAnomalies };
  }

  // Defensive programming: ensure assignedAssets exists
  if (!soldier.assignedAssets) {
    console.warn("Soldier missing assignedAssets:", soldier);
    return { anomalies, fieldAnomalies };
  }

  const { assignedAssets } = soldier;

  // בדיקת נשק אישי
  if (
    assignedAssets.personalWeaponNumber &&
    !report.values.personalWeaponNumber
  ) {
    anomalies.push("missing_required");
    fieldAnomalies["personalWeaponNumber"] = {
      type: "missing_required",
      message: "חסר מספר נשק אישי",
    };
  } else if (
    assignedAssets.personalWeaponNumber &&
    report.values.personalWeaponNumber &&
    String(assignedAssets.personalWeaponNumber).trim() !==
      String(report.values.personalWeaponNumber).trim()
  ) {
    anomalies.push("unexpected_item");
    fieldAnomalies["personalWeaponNumber"] = {
      type: "unexpected_item",
      message: `נשק שגוי - דווח ${String(
        report.values.personalWeaponNumber
      ).trim()}, מוקצה ${String(assignedAssets.personalWeaponNumber).trim()}`,
    };
  }
  // בדיקת כוונת אישית
  if (
    assignedAssets.personalSightsNumber &&
    !report.values.personalSightsNumber
  ) {
    anomalies.push("missing_required");
    fieldAnomalies["personalSightsNumber"] = {
      type: "missing_required",
      message: "חסר מספר כוונת",
    };
  } else if (
    assignedAssets.personalSightsNumber &&
    report.values.personalSightsNumber &&
    String(assignedAssets.personalSightsNumber).trim() !==
      String(report.values.personalSightsNumber).trim()
  ) {
    anomalies.push("unexpected_item");
    fieldAnomalies["personalSightsNumber"] = {
      type: "unexpected_item",
      message: `כוונת שגויה - דווח ${String(
        report.values.personalSightsNumber
      ).trim()}, מוקצה ${String(assignedAssets.personalSightsNumber).trim()}`,
    };
  }

  // בדיקת ראיית לילה
  if (assignedAssets.nightVisionNumber && !report.values.nightVisionNumber) {
    anomalies.push("missing_required");
    fieldAnomalies["nightVisionNumber"] = {
      type: "missing_required",
      message: "חסר מספר ראיית לילה",
    };
  } else if (
    assignedAssets.nightVisionNumber &&
    report.values.nightVisionNumber &&
    String(assignedAssets.nightVisionNumber).trim() !==
      String(report.values.nightVisionNumber).trim()
  ) {
    anomalies.push("unexpected_item");
    fieldAnomalies["nightVisionNumber"] = {
      type: "unexpected_item",
      message: `ראיית לילה שגויה - דווח ${String(
        report.values.nightVisionNumber
      ).trim()}, מוקצה ${String(assignedAssets.nightVisionNumber).trim()}`,
    };
  }

  // בדיקת משקפת
  if (assignedAssets.binocularsNumber && !report.values.binocularsNumber) {
    anomalies.push("missing_required");
    fieldAnomalies["binocularsNumber"] = {
      type: "missing_required",
      message: "חסר מספר משקפת",
    };
  } else if (
    assignedAssets.binocularsNumber &&
    report.values.binocularsNumber &&
    String(assignedAssets.binocularsNumber).trim() !==
      String(report.values.binocularsNumber).trim()
  ) {
    anomalies.push("unexpected_item");
    fieldAnomalies["binocularsNumber"] = {
      type: "unexpected_item",
      message: `משקפת שגויה - דווח ${String(
        report.values.binocularsNumber
      ).trim()}, מוקצה ${String(assignedAssets.binocularsNumber).trim()}`,
    };
  }

  // בדיקת מצפן
  if (assignedAssets.hasCompass && !report.values.hasCompass) {
    anomalies.push("missing_required");
    fieldAnomalies["hasCompass"] = {
      type: "missing_required",
      message: "חסר מצפן",
    };
  }

  // בדיקת פריטים לא צפויים
  if (
    !assignedAssets.personalWeaponNumber &&
    report.values.personalWeaponNumber
  ) {
    anomalies.push("unexpected_item");
    fieldAnomalies["personalWeaponNumber"] = {
      type: "unexpected_item",
      message: "נשק לא מוקצה",
    };
  }
  if (
    !assignedAssets.personalSightsNumber &&
    report.values.personalSightsNumber
  ) {
    anomalies.push("unexpected_item");
    fieldAnomalies["personalSightsNumber"] = {
      type: "unexpected_item",
      message: "כוונת לא מוקצה",
    };
  }
  if (!assignedAssets.nightVisionNumber && report.values.nightVisionNumber) {
    anomalies.push("unexpected_item");
    fieldAnomalies["nightVisionNumber"] = {
      type: "unexpected_item",
      message: "ראיית לילה לא מוקצה",
    };
  }
  if (!assignedAssets.binocularsNumber && report.values.binocularsNumber) {
    anomalies.push("unexpected_item");
    fieldAnomalies["binocularsNumber"] = {
      type: "unexpected_item",
      message: "משקפת לא מוקצה",
    };
  }
  if (!assignedAssets.hasCompass && report.values.hasCompass) {
    anomalies.push("unexpected_item");
    fieldAnomalies["hasCompass"] = {
      type: "unexpected_item",
      message: "מצפן לא מוקצה",
    };
  }

  // בדיקת כמויות עודף בצל״מ רפואי
  if ((assignedAssets.actiq || 0) < (report.values.actiq || 0)) {
    anomalies.push("excess_quantity");
    fieldAnomalies["actiq"] = {
      type: "excess_quantity",
      message: `עודף אקטיק - דווח ${report.values.actiq}, מוקצה ${
        assignedAssets.actiq || 0
      }`,
    };
  }
  if ((assignedAssets.morphine || 0) < (report.values.morphine || 0)) {
    anomalies.push("excess_quantity");
    fieldAnomalies["morphine"] = {
      type: "excess_quantity",
      message: `עודף מורפיום - דווח ${report.values.morphine}, מוקצה ${
        assignedAssets.morphine || 0
      }`,
    };
  }
  if ((assignedAssets.midazolam || 0) < (report.values.midazolam || 0)) {
    anomalies.push("excess_quantity");
    fieldAnomalies["midazolam"] = {
      type: "excess_quantity",
      message: `עודף מידזולאם - דווח ${report.values.midazolam}, מוקצה ${
        assignedAssets.midazolam || 0
      }`,
    };
  }
  if ((assignedAssets.ketamine50mg || 0) < (report.values.ketamine50mg || 0)) {
    anomalies.push("excess_quantity");
    fieldAnomalies["ketamine50mg"] = {
      type: "excess_quantity",
      message: `עודף קטמין 50מ"ג - דווח ${report.values.ketamine50mg}, מוקצה ${
        assignedAssets.ketamine50mg || 0
      }`,
    };
  }
  if ((assignedAssets.ketamine10mg || 0) < (report.values.ketamine10mg || 0)) {
    anomalies.push("excess_quantity");
    fieldAnomalies["ketamine10mg"] = {
      type: "excess_quantity",
      message: `עודף קטמין 10מ"ג - דווח ${report.values.ketamine10mg}, מוקצה ${
        assignedAssets.ketamine10mg || 0
      }`,
    };
  }

  // בדיקת ערכים לא תקינים (כמויות שליליות)
  if ((report.values.actiq || 0) < 0) {
    anomalies.push("invalid_value");
    fieldAnomalies["actiq"] = {
      type: "invalid_value",
      message: "ערך שלילי",
    };
  }
  if ((report.values.morphine || 0) < 0) {
    anomalies.push("invalid_value");
    fieldAnomalies["morphine"] = {
      type: "invalid_value",
      message: "ערך שלילי",
    };
  }
  if ((report.values.midazolam || 0) < 0) {
    anomalies.push("invalid_value");
    fieldAnomalies["midazolam"] = {
      type: "invalid_value",
      message: "ערך שלילי",
    };
  }
  if ((report.values.ketamine50mg || 0) < 0) {
    anomalies.push("invalid_value");
    fieldAnomalies["ketamine50mg"] = {
      type: "invalid_value",
      message: "ערך שלילי",
    };
  }
  if ((report.values.ketamine10mg || 0) < 0) {
    anomalies.push("invalid_value");
    fieldAnomalies["ketamine10mg"] = {
      type: "invalid_value",
      message: "ערך שלילי",
    };
  }

  return { anomalies, fieldAnomalies };
}

/**
 * שילוב נתוני לוחמים עם דיווחים יומיים לתצוגת טבלה
 * This function uses header-based column mapping for robust data extraction
 */
export async function fetchAssetsReportTableData(
  date: string
): Promise<SoldierReportRow[]> {
  try {
    const [soldiers, reports] = await Promise.all([
      fetchSoldiers(),
      fetchDailyReports(date),
    ]);

    // יצירת מפה של דיווחים לפי מספר אישי לחיפוש מהיר
    const reportMap = new Map<string, DailyReport>();
    reports.forEach((report) => {
      reportMap.set(report.metadata.personalNumber, report);
    });

    // שילוב נתוני לוחמים עם דיווחים
    const combinedData = soldiers.map((soldier) => {
      const report = reportMap.get(soldier.metadata.personalNumber);

      // ✅ Complete object:
      if (!report) {
        return {
          metadata: soldier.metadata,
          assignedAssets: soldier.assignedAssets,
          reportedAssets: {
            personalWeaponNumber: undefined,
            personalSightsNumber: undefined,
            nightVisionNumber: undefined,
            binocularsNumber: undefined,
            hasCompass: undefined,
            actiq: undefined,
            morphine: undefined,
            midazolam: undefined,
            ketamine50mg: undefined,
            ketamine10mg: undefined,
          },
          anomalies: ["no_report"] as AnomalyType[],
          fieldAnomalies: {},
          hasReport: false,
        };
      }

      const anomalyResult = detectAnomalies(soldier, report);

      const soldierReportRow = {
        metadata: soldier.metadata,
        assignedAssets: soldier.assignedAssets,
        reportedAssets: report.values,
        anomalies: anomalyResult.anomalies,
        fieldAnomalies: anomalyResult.fieldAnomalies,
        hasReport: !!report,
      };

      return soldierReportRow;
    });

    return combinedData;
  } catch (error) {
    console.error("נכשל באחזור נתוני טבלת צל״מ:", error);
    throw error;
  }
}
