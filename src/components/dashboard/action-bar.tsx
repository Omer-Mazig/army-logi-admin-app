import { Button } from "@/components/ui/button";
import { MessageCircleIcon } from "lucide-react";
import type { SoldierReportRow } from "@/lib/types";

interface ActionBarProps {
  selectedCount: number;
  selectedSoldiers: SoldierReportRow[];
  onWhatsAppSend: (soldiers: SoldierReportRow[]) => void;
}

export function ActionBar({
  selectedCount,
  selectedSoldiers,
  onWhatsAppSend,
}: ActionBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 sm:p-4 rounded-lg min-h-[4rem]">
      <div className="flex items-center gap-2">
        {selectedCount > 0 ? (
          <span className="text-sm font-medium">
            נבחרו {selectedCount} לוחמים
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            בחר לוחמים מהטבלה כדי לשלוח הודעות או לבצע פעולות נוספות
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onWhatsAppSend(selectedSoldiers)}
              className="flex items-center gap-2"
            >
              <MessageCircleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">שלח וואטסאפ</span>
              <span className="sm:hidden">וואטסאפ</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
