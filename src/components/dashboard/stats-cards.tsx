import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  totalSoldiers: number;
  reportedSoldiers: number;
  soldiersWithAnomalies: number;
  isLoading?: boolean;
}

export function StatsCards({
  totalSoldiers,
  reportedSoldiers,
  soldiersWithAnomalies,
  isLoading = false,
}: StatsCardsProps) {
  const completionPercentage =
    totalSoldiers > 0
      ? Math.round((reportedSoldiers / totalSoldiers) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה"כ לוחמים</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-12" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              דיווחים שהוגשו
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">חריגות שזוהו</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">סה"כ לוחמים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSoldiers}</div>
          <p className="text-xs text-muted-foreground">בפלוגה</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">דיווחים שהוגשו</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{reportedSoldiers}</div>
          <p className="text-xs text-muted-foreground">
            {completionPercentage}% השלמה
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">חריגות שזוהו</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            {soldiersWithAnomalies}
          </div>
          <p className="text-xs text-muted-foreground">דורשות טיפול</p>
        </CardContent>
      </Card>
    </div>
  );
}
