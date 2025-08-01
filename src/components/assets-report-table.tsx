import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionBar } from "@/components/dashboard/action-bar";
import { AssetsReportFilters } from "@/components/assets-report-filters";
import { whatsappService } from "@/lib/whatsapp-service";
import type { SoldierReportRow, FieldAnomaly } from "@/lib/types";

interface AssetsReportTableProps {
  data: SoldierReportRow[];
}

const formatCellValue = (value: any) => {
  if (value === undefined || value === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (typeof value === "boolean") {
    return value ? "יש" : "אין";
  }

  return value;
};

const getCellClassName = (fieldAnomaly?: FieldAnomaly) => {
  if (!fieldAnomaly) return "";

  // TODO: add colors to the anomalies
  switch (fieldAnomaly.type) {
    case "missing_required":
      return "bg-red-500";
    case "unexpected_item":
      return "bg-red-500";
    case "excess_quantity":
      return "bg-red-500";
    case "invalid_value":
      return "bg-red-500";
    default:
      return "";
  }
};

const CellWithAnomaly = ({
  value,
  fieldName,
  soldier,
}: {
  value: any;
  fieldName: string;
  soldier: SoldierReportRow;
}) => {
  const fieldAnomaly = soldier.fieldAnomalies[fieldName];
  const hasAnomaly = !!fieldAnomaly;

  return (
    <TableCell
      className={cn(
        "border-l px-2 sm:px-4 py-2 sm:py-3 text-center relative",
        getCellClassName(fieldAnomaly)
      )}
    >
      <div className="flex items-center justify-center">
        <span>{formatCellValue(value)}</span>
        {hasAnomaly && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertTriangleIcon className="h-3 w-3 absolute left-1 top-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{fieldAnomaly.message}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </TableCell>
  );
};

export function AssetsReportTable({ data }: AssetsReportTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [filteredData, setFilteredData] = useState<SoldierReportRow[]>(data);

  // Handle filtered data changes from the filter component
  const handleFilteredDataChange = useCallback(
    (filtered: SoldierReportRow[]) => {
      setFilteredData(filtered);
    },
    []
  );

  // Update selectAll state when filtered data changes
  useEffect(() => {
    if (filteredData.length === 0) {
      setSelectAll(false);
    } else {
      const selectedInFiltered = filteredData.filter((soldier) =>
        selectedRows.has(soldier.metadata.personalNumber)
      );
      setSelectAll(selectedInFiltered.length === filteredData.length);
    }
  }, [filteredData, selectedRows]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedRows(
        new Set(filteredData.map((soldier) => soldier.metadata.personalNumber))
      );
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (personalNumber: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(personalNumber);
    } else {
      newSelectedRows.delete(personalNumber);
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.size === filteredData.length);
  };

  const selectedSoldiers = filteredData.filter((soldier) =>
    selectedRows.has(soldier.metadata.personalNumber)
  );

  return (
    <div className="space-y-4">
      <AssetsReportFilters
        data={data}
        onFilteredDataChange={handleFilteredDataChange}
      />

      <ActionBar
        selectedCount={selectedRows.size}
        selectedSoldiers={selectedSoldiers}
        onWhatsAppSend={whatsappService.sendWhatsApp}
      />

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table className="text-right">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center border-l px-1 sm:px-2 py-2 sm:py-3 font-semibold w-12">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="בחר הכל"
                  />
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  שם
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  מ.א
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  סטטוס
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  נשק
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  כוונת
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  ראיית לילה
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  משקפת
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  מצפן
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  אקטיק
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  מורפיום
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  מידזולאם
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  קטמין 50מ"ג
                </TableHead>
                <TableHead className="text-center border-l px-2 sm:px-4 py-2 sm:py-3 font-semibold">
                  קטמין 10מ"ג
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((soldier, index) => (
                <TableRow
                  onClick={() =>
                    handleSelectRow(
                      soldier.metadata.personalNumber,
                      !selectedRows.has(soldier.metadata.personalNumber)
                    )
                  }
                  key={soldier.metadata.personalNumber}
                  className={index % 2 === 0 ? "bg-gray-50/10" : ""}
                >
                  <TableCell className="border-l px-1 sm:px-2 py-2 sm:py-3 text-center w-12">
                    <Checkbox
                      checked={selectedRows.has(
                        soldier.metadata.personalNumber
                      )}
                      onCheckedChange={(checked) =>
                        handleSelectRow(
                          soldier.metadata.personalNumber,
                          checked as boolean
                        )
                      }
                      aria-label={`בחר ${soldier.metadata.fullName}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium border-l px-2 sm:px-4 py-2 sm:py-3 text-center">
                    {soldier.metadata.fullName}
                  </TableCell>
                  <TableCell className="border-l px-2 sm:px-4 py-2 sm:py-3 text-center">
                    {soldier.metadata.personalNumber}
                  </TableCell>
                  <TableCell className="border-l px-2 sm:px-4 py-2 sm:py-3 text-center">
                    {!soldier.hasReport ? (
                      <Badge
                        variant="outline"
                        className="text-red-600 dark:text-red-400"
                      >
                        חסר
                      </Badge>
                    ) : soldier.anomalies.length > 0 ? (
                      <Badge
                        variant="outline"
                        className="text-amber-600 dark:text-amber-400"
                      >
                        בעיות ({soldier.anomalies.length})
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-green-600 dark:text-green-400"
                      >
                        הושלם
                      </Badge>
                    )}
                  </TableCell>
                  <CellWithAnomaly
                    value={soldier.reportedAssets.personalWeaponNumber}
                    fieldName="personalWeaponNumber"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.personalSightsNumber}
                    fieldName="personalSightsNumber"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.nightVisionNumber}
                    fieldName="nightVisionNumber"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.binocularsNumber}
                    fieldName="binocularsNumber"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.hasCompass}
                    fieldName="hasCompass"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.actiq}
                    fieldName="actiq"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.morphine}
                    fieldName="morphine"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.midazolam}
                    fieldName="midazolam"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.ketamine50mg}
                    fieldName="ketamine50mg"
                    soldier={soldier}
                  />
                  <CellWithAnomaly
                    value={soldier.reportedAssets.ketamine10mg}
                    fieldName="ketamine10mg"
                    soldier={soldier}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {data.length === 0
              ? "לא נמצאו לוחמים לתאריך זה."
              : "לא נמצאו תוצאות המתאימות לחיפוש. נסה לשנות את הסינונים."}
          </div>
        )}
      </div>
    </div>
  );
}
