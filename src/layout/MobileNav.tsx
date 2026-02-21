import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ArrowLeftRight,
  LayoutGrid,
  Logs,
  Menu,
  Receipt,
  ReceiptText,
  Store,
  UserCheck,
  Users,
  X,
  PackageOpen,
  PackageCheck,
  LogOut,
} from "lucide-react";
import { cn } from "../utils/cn";
import { logout } from "../utils/logout";

const mainMenuOptions = [
  {
    text: "Dashboard",
    url: "/dashboard",
    icon: <LayoutGrid size={16} />,
    slug: "read_order",
  },
  {
    text: "Transactions",
    url: "/dashboard/transactions",
    icon: <ArrowLeftRight size={16} />,
    slug: "view_reports",
  },
  {
    text: "Customers",
    url: "/dashboard/customers",
    icon: <Users size={16} />,
    slug: "read_customer",
  },
  {
    text: "Sales",
    url: "/dashboard/invoices",
    icon: <ReceiptText size={16} />,
    slug: "read_order",
  },
  {
    text: "Inventory",
    url: "/dashboard/inventory",
    icon: <Store size={16} />,
    slug: "read_product",
  },
  {
    text: "Opening Stock",
    url: "/dashboard/opening-stock",
    icon: <PackageOpen size={16} />,
    slug: "read_product",
  },
  {
    text: "Closing Stock",
    url: "/dashboard/closing-stock",
    icon: <PackageCheck size={16} />,
    slug: "read_product",
  },
  {
    text: "Vendors",
    url: "/dashboard/vendors",
    icon: <UserCheck size={16} />,
    slug: "read_vendor",
  },
  {
    text: "Expenses",
    url: "/dashboard/expenses",
    icon: <Receipt size={16} />,
    slug: "view_reports",
  },
  {
    text: "Manage Users",
    url: "/dashboard/users",
    icon: <Users size={16} />,
    slug: "create_user",
  },
  {
    text: "Audit Logs",
    url: "/dashboard/auditlog",
    icon: <Logs size={16} />,
    slug: "view_reports",
  },
];

const storedPermissions = localStorage.getItem("permissions");
const permissions = storedPermissions ? JSON.parse(storedPermissions) : null;
const permittedNavs = mainMenuOptions.filter((item) =>
  permissions?.some((p: { name: string }) => p.name === item.slug),
);

function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="lg:hidden">
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] bg-[#1e1e27] z-[100] flex flex-col transition-transform duration-300 ease-in-out shadow-2xl",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Store size={15} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">
              StoreManager
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 px-3 mb-2">
            Main Menu
          </p>
          <div className="flex flex-col gap-0.5">
            {permittedNavs.map((option, index) => {
              const isActive = option.url === location.pathname;
              return (
                <Link
                  to={option.url}
                  key={index}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/[0.06]",
                  )}
                >
                  <span className={isActive ? "text-white" : "text-white/40"}>
                    {option.icon}
                  </span>
                  {option.text}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-all group"
          >
            <LogOut
              size={15}
              className="group-hover:text-rose-400 transition-colors"
            />
            <span className="text-[12px] font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
