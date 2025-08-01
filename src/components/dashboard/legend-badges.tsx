import { Badge } from "@/components/ui/badge";

export function LegendBadges() {
  return (
    <div className="flex items-center space-x-2">
      <Badge
        variant="outline"
        className="text-green-600"
      >
        ✓ דווח
      </Badge>
      <Badge
        variant="outline"
        className="text-amber-600"
      >
        ⚠ חריגה
      </Badge>
      <Badge
        variant="outline"
        className="text-red-600"
      >
        ✗ חסר
      </Badge>
    </div>
  );
}
