import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main className="mx-auto px-0 sm:px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
