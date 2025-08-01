import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ASSETS_REPORT_FORM_LINK = import.meta.env.VITE_ASSETS_REPORT_FORM_LINK;
const ASSETS_REPORT_SHEET_LINK = import.meta.env.VITE_ASSETS_REPORT_SHEET_LINK;
const ASSETS_REPORT_HISTORY_SHEET_LINK = import.meta.env
  .VITE_ASSETS_REPORT_HISTORY_SHEET_LINK;

export function QuickLinks() {
  console.log("ASSETS_REPORT_FORM_LINK", ASSETS_REPORT_FORM_LINK);
  console.log("ASSETS_REPORT_SHEET_LINK", ASSETS_REPORT_SHEET_LINK);
  console.log(
    "ASSETS_REPORT_HISTORY_SHEET_LINK",
    ASSETS_REPORT_HISTORY_SHEET_LINK
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">קישורים מהירים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            asChild
          >
            <a
              href={ASSETS_REPORT_FORM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start space-y-1"
            >
              <span className="font-medium">טופס דו״ח צל״מ</span>
              <span className="text-xs text-muted-foreground">
                מילוי דיווח יומי
              </span>
            </a>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            asChild
          >
            <a
              href={ASSETS_REPORT_SHEET_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start space-y-1"
            >
              <span className="font-medium">טבלת אמצעיים משוייכים</span>
              <span className="text-xs text-muted-foreground">
                רשימת ציוד מחלקתי
              </span>
            </a>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            asChild
          >
            <a
              href={ASSETS_REPORT_HISTORY_SHEET_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start space-y-1"
            >
              <span className="font-medium">טבלת דיווחים</span>
              <span className="text-xs text-muted-foreground">
                היסטוריית דיווחים
              </span>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
