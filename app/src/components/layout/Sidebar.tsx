import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Boxes,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LayoutTemplate,
  Package,
  ShieldAlert,
  ShoppingCart,
  UserCog,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

const menuItems: {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  permission?: string;
}[] = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    permission: PERMISSIONS.dashboard.view,
  },
  {
    name: "Orders",
    path: "/orders",
    icon: ShoppingCart,
    permission: PERMISSIONS.orders.view,
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
    permission: PERMISSIONS.products.view,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Boxes,
    permission: PERMISSIONS.inventory.view,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
    permission: PERMISSIONS.customers.view,
  },
  {
    name: "Audit Logs",
    path: "/audit-logs",
    icon: ShieldAlert,
    permission: PERMISSIONS.audit.view,
  },
  {
    name: "User Management",
    path: "/users",
    icon: UserCog,
    permission: PERMISSIONS.users.manage,
  },
  {
    name: "Form Templates",
    path: "/form-templates",
    icon: LayoutTemplate,
    permission: PERMISSIONS.orders.manage,
  },
  {
    name: "Customer Groups",
    path: "/customer-groups",
    icon: UsersRound,
    permission: PERMISSIONS.orders.manage,
  },
  { name: "Profile", path: "/profile", icon: UserRound },
];

const STORAGE_KEY = "sidebar-collapsed";

function getInitialCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  const visibleItems = menuItems.filter(
    (item) => !item.permission || hasPermission(user, item.permission)
  );

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  return (
    <aside
      className={`flex min-h-screen flex-col border-r bg-card transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h2
          className={`font-bold ${collapsed ? "text-lg" : "text-xl"}`}
        >
          {collapsed ? "O" : "OMS"}
        </h2>

        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground shadow-sm transition hover:border-ring hover:bg-muted hover:text-foreground active:scale-95"
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <ChevronsLeft className="size-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center rounded-lg py-2 transition ${
                    !collapsed ? "gap-3 px-4" : "justify-center"
                  } ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <span
                    className={`flex items-center justify-center rounded-md ${
                      collapsed ? "size-9" : ""
                    }`}
                  >
                    <Icon className="size-5 shrink-0" strokeWidth={1.75} />
                  </span>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
