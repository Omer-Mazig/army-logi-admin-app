import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAssetsReportTableData } from "@/lib/assets-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCwIcon,
  MessageCircleIcon,
  Loader2,
  PackageIcon,
  ChevronDownIcon,
  UsersIcon,
} from "lucide-react";
import { AssetsReportTable } from "@/components/assets-report-table";
import { StatsCards, DateSelector, LegendBadges } from "@/components/dashboard";
import { QuickLinks } from "@/components/quick-links";
import { toast } from "sonner";
import { whatsappService } from "@/lib/whatsapp-service";
import type { SoldierReportRow } from "@/lib/types";

export default function AssetsReportDashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to today's date
    return new Date().toISOString().split("T")[0];
  });
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);

  const {
    data: assetsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<SoldierReportRow[]>({
    queryKey: ["assets-report-table", selectedDate],
    queryFn: () => fetchAssetsReportTableData(selectedDate),
    // refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  // Toast notifications for loading state
  useEffect(() => {
    if (isFetching && assetsData) {
      // Only show "updating" toast if we already have data (not initial load)
      toast.loading("מעדכן נתוני צל״מ...", {
        id: "assets-report-refresh",
        duration: Infinity,
      });
    } else {
      // Dismiss the loading toast when done
      toast.dismiss("assets-report-refresh");
      if (assetsData && !isLoading) {
        // Show success toast briefly
        toast.success("נתוני הצל״מ עודכנו בהצלחה", {
          duration: 2000,
        });
      }
    }
  }, [isFetching, assetsData, isLoading]);

  const handleRefresh = () => {
    refetch();
  };

  const handleSendUnreportedWhatsApp = () => {
    const date = new Date().toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const namesList = unreportedSoldiers
      .map((soldier, index) => `${index + 1}. ${soldier.metadata.fullName}`)
      .join("\n");

    const message = `${date}\n\nלא דיווחו דו״ח צל״מ:\n${namesList}\n\n*נא לדווח בהקדם*\n\nקישור לדיווח:\nhttps://forms.gle/UbzHoEmdwwhiT5Be8`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/972505583758?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSendCompanyAssetsWhatsApp = () => {
    if (!assetsData) {
      toast.error("אין נתונים זמינים לשליחה");
      return;
    }

    whatsappService.sendCompanyAssetsWhatsApp(assetsData);
    toast.success("דו״ח צל״מ נשלח בהצלחה");
  };

  const handleSendReminderToUnreported = () => {
    if (unreportedSoldiers.length === 0) {
      toast.error("אין חיילים שלא דיווחו");
      return;
    }
    setIsReminderDialogOpen(true);
  };

  const handleSendIndividualReminder = (soldier: SoldierReportRow) => {
    if (!soldier.metadata.phoneNumber) {
      toast.error(`לא נמצא מספר טלפון עבור ${soldier.metadata.fullName}`);
      return;
    }

    whatsappService.sendWhatsApp([soldier]);
    toast.success(`נשלחה תזכורת ל${soldier.metadata.fullName}`);
  };

  // Calculate statistics
  const totalSoldiers = assetsData?.length || 0;
  const reportedSoldiers =
    assetsData?.filter((soldier) => soldier.hasReport).length || 0;
  const soldiersWithAnomalies =
    assetsData?.filter((soldier) => soldier.anomalies.length > 0).length || 0;
  const unreportedSoldiers =
    assetsData?.filter((soldier) => !soldier.hasReport) || [];

  if (error) {
    return (
      <div className="mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">שגיאה בטעינת הנתונים</CardTitle>
            <CardDescription className="text-red-600">
              נכשל בטעינת נתוני הצל״מ. אנא נסה שוב.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRefresh}
              variant="outline"
            >
              <RefreshCwIcon className="ml-2 h-4 w-4" />
              נסה שוב
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto py-2 sm:py-6 px-2 sm:px-0 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">לוח בקרת צל״מ</h1>
          <p className="text-muted-foreground">
            מעקב אחר דיווחי צל״מ יומיים וזיהוי חריגות
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    טוען נתונים...
                  </>
                ) : (
                  <>
                    <MessageCircleIcon className="h-4 w-4" />
                    הודעות WhatsApp
                    <ChevronDownIcon className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <DropdownMenuItem
                onClick={handleSendCompanyAssetsWhatsApp}
                disabled={!assetsData || assetsData.length === 0}
                className="flex items-center gap-2"
              >
                <PackageIcon className="h-4 w-4" />
                דו״ח צל״מ לארמו״ן
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSendUnreportedWhatsApp}
                disabled={unreportedSoldiers.length === 0}
                className="flex items-center gap-2"
              >
                <UsersIcon className="h-4 w-4" />
                רשימת לא דיווחו ({unreportedSoldiers.length})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSendReminderToUnreported}
                disabled={unreportedSoldiers.length === 0}
                className="flex items-center gap-2"
              >
                <MessageCircleIcon className="h-4 w-4" />
                תזכורות אישיות ({unreportedSoldiers.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                מרענן...
              </>
            ) : (
              <>
                <RefreshCwIcon className="ml-2 h-4 w-4" />
                רענן
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Date Selection and Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <div className="md:col-span-3">
          <StatsCards
            totalSoldiers={totalSoldiers}
            reportedSoldiers={reportedSoldiers}
            soldiersWithAnomalies={soldiersWithAnomalies}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
            <div>
              <CardTitle>דיווח צל״מ יומי</CardTitle>
              <CardDescription>
                מצב הצל״מ ליום{" "}
                {new Date(selectedDate).toLocaleDateString("he-IL")}
              </CardDescription>
            </div>
            <LegendBadges />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCwIcon className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="mr-2 text-muted-foreground">
                טוען נתוני צל״מ...
              </span>
            </div>
          ) : assetsData ? (
            <AssetsReportTable data={assetsData} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              אין נתונים זמינים לתאריך זה.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <QuickLinks />

      {/* Individual Reminders Dialog */}
      <Dialog
        open={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>שליחת תזכורות אישיות</DialogTitle>
            <DialogDescription>
              לחץ על שם חייל כדי לשלוח לו תזכורת WhatsApp אישית
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {unreportedSoldiers.map((soldier) => (
              <div
                key={soldier.metadata.personalNumber}
                className={`p-3 rounded-lg border transition-colors ${
                  soldier.metadata.phoneNumber
                    ? "hover:bg-muted cursor-pointer border-border"
                    : "border-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                }`}
                onClick={() => {
                  if (soldier.metadata.phoneNumber) {
                    handleSendIndividualReminder(soldier);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircleIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {soldier.metadata.fullName}
                    </span>
                  </div>
                  {!soldier.metadata.phoneNumber && (
                    <span className="text-xs text-muted-foreground">
                      אין טלפון
                    </span>
                  )}
                </div>
                {soldier.metadata.phoneNumber && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {soldier.metadata.phoneNumber}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
