import type { SoldierReportRow } from "@/lib/types";

export const whatsappService = {
  sendWhatsApp: (soldiers: SoldierReportRow[]) => {
    if (soldiers.length !== 1) {
      return;
    }

    const message = encodeURIComponent(
      `ערב טוב. אנא מלא דו״ח צל״מ עד השעה 18:00. תודה`
    );
    const url = `https://wa.me/972${soldiers[0].metadata.phoneNumber}?text=${message}`;
    window.open(url, "_blank");
  },

  sendCompanyAssetsWhatsApp: (
    soldiers: SoldierReportRow[],
    phoneNumber?: string
  ) => {
    if (!soldiers || soldiers.length === 0) {
      return;
    }

    // Format assets message in Hebrew
    let message = "דוח צל״ם מוקצה לפלוגה:\n\n";

    soldiers.forEach((soldier) => {
      const { metadata, assignedAssets } = soldier;
      message += `${metadata.fullName}:\n`;

      // Add assigned assets for this soldier
      const assets = [];

      if (assignedAssets.personalWeaponNumber) {
        assets.push(`נשק אישי: ${assignedAssets.personalWeaponNumber}`);
      }

      if (assignedAssets.personalSightsNumber) {
        assets.push(`כוונת: ${assignedAssets.personalSightsNumber}`);
      }

      if (assignedAssets.nightVisionNumber) {
        assets.push(`אמר״ל: ${assignedAssets.nightVisionNumber}`);
      }

      if (assignedAssets.binocularsNumber) {
        assets.push(`משקפת: ${assignedAssets.binocularsNumber}`);
      }

      if (assignedAssets.hasCompass) {
        assets.push(`מצפן: יש`);
      }

      if (assets.length > 0) {
        message += assets.join("\n") + "\n\n";
      } else {
        message += "אין צל״ם מוקצה\n\n";
      }
    });

    const encodedMessage = encodeURIComponent(message);
    // Default phone number if none provided (same as current unreported function)
    const targetPhone = phoneNumber || "972505583758";
    const url = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
    window.open(url, "_blank");
  },
};
