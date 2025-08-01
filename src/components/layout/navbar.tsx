import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Package, Home, BarChart3, Users, Settings, Menu } from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    name: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
  {
    name: "Soldiers",
    icon: Users,
    href: "/soldiers",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <span className="text-xl font-bold">Logi</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </div>

          {/* Right side - Theme toggle and mobile menu */}
          <div className="flex items-center space-x-2">
            {/* Desktop theme toggle */}
            <div className="hidden md:block">
              <ModeToggle />
            </div>

            {/* Mobile Menu */}
            <Sheet
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64"
              >
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-2 px-2">
                    <Package className="h-6 w-6" />
                    <span className="text-xl font-bold">Logi</span>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-2">
                    {navigationItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Button
                          key={item.name}
                          variant="ghost"
                          className="justify-start gap-3 h-12"
                          onClick={() => setIsOpen(false)}
                        >
                          <IconComponent className="h-5 w-5" />
                          {item.name}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Mobile Theme Toggle */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="px-2">
                      <ModeToggle />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
