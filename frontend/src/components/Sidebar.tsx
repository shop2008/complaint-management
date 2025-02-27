import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";
import { useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    href: string;
    title: string;
    icon: string;
  }[];
}

function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const location = useLocation();
  const { isCollapsed } = useSidebar();

  return (
    <nav className={cn("grid gap-1 p-2", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors",
            location.pathname === item.href
              ? "bg-accent/50 text-accent-foreground"
              : "transparent text-muted-foreground hover:text-primary",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <span
            className={cn(
              "material-icons transition-all",
              isCollapsed ? "text-xl" : "mr-3 text-lg group-hover:scale-110",
              location.pathname === item.href
                ? "text-primary"
                : "text-muted-foreground group-hover:text-primary"
            )}
          >
            {item.icon}
          </span>
          {!isCollapsed && (
            <span
              className={cn(
                "transition-colors duration-200",
                location.pathname === item.href
                  ? "font-semibold text-primary"
                  : "text-muted-foreground group-hover:text-primary"
              )}
            >
              {item.title}
            </span>
          )}
          {!isCollapsed && location.pathname === item.href && (
            <span className="ml-auto h-1 w-1 rounded-full bg-primary" />
          )}
        </Link>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  const { currentUser } = useAuth();
  const {
    isCollapsed,
    setIsCollapsed,
    isMobile,
    isMobileOpen,
    setIsMobileOpen,
  } = useSidebar();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (
        isMobile &&
        isMobileOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isMobileOpen, setIsMobileOpen]);

  if (!currentUser) return null;

  const sidebarWidth = isCollapsed ? "w-20" : "w-64";
  const mobileClasses = isMobile
    ? `transform ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`
    : "";

  // Define navigation items based on user role
  const getNavItems = () => {
    const items = [];

    if (currentUser.role === "Customer") {
      items.push({
        href: "/submit-complaint",
        title: "Submit Complaint",
        icon: "add_circle",
      });
    }

    if (currentUser.role === "Admin") {
      items.push(
        {
          href: "/users",
          title: "User Management",
          icon: "people",
        },
        {
          href: "/manager",
          title: "Complaint Management",
          icon: "dashboard",
        }
      );
    }

    if (currentUser.role === "Manager") {
      items.push({
        href: "/manager",
        title: "Manager Dashboard",
        icon: "dashboard",
      });
    }
    if (
      currentUser.role === "Staff" ||
      currentUser.role === "Manager" ||
      currentUser.role === "Admin"
    ) {
      items.push({
        href: "/staff",
        title: "My Assigned Complaints",
        icon: "assignment",
      });
    }

    return items;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed z-50 bottom-6 right-6 shadow-md md:hidden"
          aria-label="Toggle Menu"
        >
          <span className="material-icons text-xl">
            {isMobileOpen ? "close" : "menu"}
          </span>
        </Button>
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          "bg-background border-r fixed left-0 top-16",
          sidebarWidth,
          "min-h-screen transition-all duration-300 ease-in-out",
          mobileClasses,
          "z-40"
        )}
      >
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className={cn("space-y-4 py-4", isCollapsed ? "px-2" : "px-4")}>
            {/* User Section */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative h-12 w-12">
                  <div className="rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center h-full w-full">
                    <span className="material-icons text-white text-2xl">
                      person
                    </span>
                  </div>
                </div>
              </div>
              {!isCollapsed && (
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {currentUser.role}
                  </h2>
                  <p className="text-sm text-muted-foreground">Welcome back!</p>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Navigation */}
            <SidebarNav items={getNavItems()} />
          </div>
        </ScrollArea>

        {/* Desktop Toggle Button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute -right-3 top-4 h-6 w-6",
              "bg-background border shadow-sm",
              "hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "rotate-180"
            )}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="material-icons text-sm">chevron_left</span>
          </Button>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
