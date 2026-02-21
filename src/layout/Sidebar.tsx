import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import SidebarTab from "./SidebarTab";
import {
  ArrowLeftRight,
  LayoutGrid,
  LogOut,
  Logs,
  Receipt,
  ReceiptText,
  Store,
  UserCheck,
  Users,
  PackageOpen,
  PackageCheck,
} from "lucide-react";
import { logout } from "../utils/logout";

const mainMenuOptions = [
  {
    text: "Dashboard",
    url: "/dashboard",
    icon: <LayoutGrid size={15} />,
    slug: "read_order",
  },
  {
    text: "Transactions",
    url: "/dashboard/transactions",
    icon: <ArrowLeftRight size={15} />,
    slug: "view_reports",
  },
  {
    text: "Customers",
    url: "/dashboard/customers",
    icon: <Users size={15} />,
    slug: "read_customer",
  },
  {
    text: "Sales",
    url: "/dashboard/invoices",
    icon: <ReceiptText size={15} />,
    slug: "read_order",
  },
  {
    text: "Inventory",
    url: "/dashboard/inventory",
    icon: <Store size={15} />,
    slug: "read_product",
  },
  {
    text: "Opening Stock",
    url: "/dashboard/opening-stock",
    icon: <PackageOpen size={15} />,
    slug: "read_product",
  },
  {
    text: "Closing Stock",
    url: "/dashboard/closing-stock",
    icon: <PackageCheck size={15} />,
    slug: "read_product",
  },
  {
    text: "Vendors",
    url: "/dashboard/vendors",
    icon: <UserCheck size={15} />,
    slug: "read_vendor",
  },
  {
    text: "Expenses",
    url: "/dashboard/expenses",
    icon: <Receipt size={15} />,
    slug: "view_reports",
  },
  {
    text: "Manage Users",
    url: "/dashboard/users",
    icon: <Users size={15} />,
    slug: "create_user",
  },
  {
    text: "Audit Logs",
    url: "/dashboard/auditlog",
    icon: <Logs size={15} />,
    slug: "view_reports",
  },
];

function Sidebar() {
  const [permittedNavs, setPermittedNavs] = useState<typeof mainMenuOptions>(
    [],
  );
  const location = useLocation();
  const { pathname } = location;

  const storedPermissions = localStorage.getItem("permissions");
  const permissions = storedPermissions ? JSON.parse(storedPermissions) : null;
  const userData = JSON.parse(localStorage.getItem("user") ?? "{}");

  const initials =
    `${userData.firstname?.[0] ?? ""}${userData.lastname?.[0] ?? ""}`.toUpperCase();
  const fullName =
    `${userData.firstname ?? ""} ${userData.lastname ?? ""}`.trim();

  useEffect(() => {
    if (permissions) {
      const navs = mainMenuOptions.filter((item) =>
        permissions.some((p: { name: string }) => p.name === item.slug),
      );
      setPermittedNavs(navs);
    }
  }, []);

  return (
    <div className="hidden h-screen w-[240px] flex-none lg:block bg-[#1e1e27]">
      <div className="fixed top-0 bottom-0 w-[240px] bg-[#1e1e27] flex flex-col overflow-hidden">
        {/* Logo / Brand area */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
              <Store size={15} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">
              Aoudit
            </span>
          </div>
        </div>

        {/* User profile */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/[0.05]">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">
                {fullName}
              </p>
              <p className="text-[10px] text-white/40 truncate">
                {userData.email ?? "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-3 no-scrollbar">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 px-3 mb-2">
            Main Menu
          </p>
          <nav className="flex flex-col gap-0.5">
            {permittedNavs.map((item) => (
              <SidebarTab
                key={item.text}
                item={item.text}
                activeOption={pathname}
                url={item.url}
                icon={item.icon}
              />
            ))}
          </nav>
        </div>

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

export default Sidebar;
