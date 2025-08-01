import AssetsReportDashboardPage from "@/pages/assets-report-dashboard-page";
import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/layout";

/**
 * Router
 * @description Router for the application
 * @returns {BrowserRouterProvider} Router provider
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <AssetsReportDashboardPage />,
      },
    ],
  },
]);
