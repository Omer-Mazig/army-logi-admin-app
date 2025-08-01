import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SearchIcon, XIcon } from "lucide-react";
import type { SoldierReportRow } from "@/lib/types";

type StatusFilter = "all" | "no-report" | "anomalies" | "both";

interface AssetsReportFiltersProps {
  data: SoldierReportRow[];
  onFilteredDataChange: (filteredData: SoldierReportRow[]) => void;
}

interface FilterRadioItemProps {
  value: string;
  id: string;
  label: string;
}

function FilterRadioItem({ value, id, label }: FilterRadioItemProps) {
  return (
    <div className="flex items-center justify-end gap-1 space-x-2 space-x-reverse">
      <Label
        htmlFor={id}
        className="text-sm"
      >
        {label}
      </Label>
      <RadioGroupItem
        value={value}
        id={id}
      />
    </div>
  );
}

export function AssetsReportFilters({
  data,
  onFilteredDataChange,
}: AssetsReportFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filter values from URL params
  const nameFilter = searchParams.get("name") || "";
  const statusFilter = (searchParams.get("status") as StatusFilter) || "all";

  // Update search params
  const updateNameFilter = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("name", value);
      } else {
        newParams.delete("name");
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const updateStatusFilter = useCallback(
    (value: StatusFilter) => {
      const newParams = new URLSearchParams(searchParams);
      if (value !== "all") {
        newParams.set("status", value);
      } else {
        newParams.delete("status");
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Filter the data based on the current filter settings
  const filteredData = useMemo(() => {
    const filtered = data.filter((soldier) => {
      // Name filter
      if (
        nameFilter &&
        !soldier.metadata.fullName
          .toLowerCase()
          .includes(nameFilter.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      switch (statusFilter) {
        case "no-report":
          return !soldier.hasReport;
        case "anomalies":
          return soldier.hasReport && soldier.anomalies.length > 0;
        case "both":
          return !soldier.hasReport || soldier.anomalies.length > 0;
        case "all":
        default:
          return true;
      }
    });

    onFilteredDataChange(filtered);
    return filtered;
  }, [data, nameFilter, statusFilter, onFilteredDataChange]);

  // Clear all filters function
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Check if any filters are active
  const hasActiveFilters = nameFilter || statusFilter !== "all";

  return (
    <div className="p-2 sm:p-4 rounded-lg border">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">סינון נתונים</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <XIcon className="h-4 w-4" />
              נקה סינונים
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name filter */}
          <div className="space-y-2">
            <Label
              htmlFor="name-filter"
              className="text-sm font-medium"
            >
              חיפוש לפי שם
            </Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name-filter"
                type="text"
                placeholder="הכנס שם לחיפוש..."
                value={nameFilter}
                onChange={(e) => updateNameFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="space-y-3 text-right">
            <Label className="text-sm font-medium">סינון לפי סטטוס</Label>
            <RadioGroup
              value={statusFilter}
              onValueChange={(value) =>
                updateStatusFilter(value as typeof statusFilter)
              }
              className="space-y-2"
            >
              <FilterRadioItem
                value="all"
                id="filter-all"
                label="הצג הכל"
              />
              <FilterRadioItem
                value="no-report"
                id="filter-no-report"
                label="חסרי דיווח בלבד"
              />
              <FilterRadioItem
                value="anomalies"
                id="filter-anomalies"
                label="עם בעיות בלבד"
              />
              <FilterRadioItem
                value="both"
                id="filter-both"
                label="חסרי דיווח או עם בעיות"
              />
            </RadioGroup>
          </div>
        </div>

        {/* Results summary */}
        <div className="text-sm text-gray-600">
          מוצגים {filteredData.length} מתוך {data.length} לוחמים
          {hasActiveFilters && (
            <span className="text-blue-600 mr-2">(מסונן)</span>
          )}
        </div>
      </div>
    </div>
  );
}
