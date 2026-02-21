import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/logout";
import { LogOut, Plus, ShoppingCart, Package } from "lucide-react";
import { Dropdown, Menu } from "antd";
import AddProductModal from "../modules/products/AddProductModal";
import InvoiceModal from "../modules/invoices/InvoiceModal";
import MobileNav from "./MobileNav";

const userData = JSON.parse(localStorage.getItem("user") ?? "{}");
const initials =
  `${userData.firstname?.[0] ?? ""}${userData.lastname?.[0] ?? ""}`.toUpperCase();
const fullName =
  `${userData.firstname ?? ""} ${userData.lastname ?? ""}`.trim();

export default function DashboardHeader() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [open, setOpen] = useState(false);

  const userMenu = (
    <Menu className="rounded-xl shadow-lg border border-gray-100 overflow-hidden p-1 min-w-[180px]">
      <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
        <p className="text-[13px] font-semibold text-gray-800">{fullName}</p>
        <p className="text-[11px] text-gray-400 truncate">
          {userData.email ?? ""}
        </p>
      </div>
      <Menu.Item key="logout" className="rounded-lg">
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-sm text-rose-600 font-medium w-full py-0.5"
        >
          <LogOut size={14} />
          Logout
        </button>
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 w-full">
      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">
        {/* Left: Mobile nav + Brand */}
        <div className="flex items-center gap-2">
          <MobileNav />
          <div className="flex items-center gap-1.5 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Package size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">Aoudit</span>
          </div>
        </div>

        {/* Right: Quick actions + Avatar */}
        <div className="flex items-center gap-2">
          {/* Quick action buttons — desktop only */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-all"
            >
              <Plus size={15} />
              Add Sale
            </button>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all"
            >
              <Plus size={15} />
              Add Product
            </button>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-6 w-px bg-gray-200" />

          {/* User avatar dropdown */}
          <Dropdown
            trigger={["click"]}
            overlay={userMenu}
            placement="bottomRight"
          >
            <button className="flex items-center gap-2 rounded-xl hover:bg-gray-50 px-2 py-1.5 transition-all">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white">
                  {initials}
                </span>
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {fullName}
              </span>
            </button>
          </Dropdown>
        </div>
      </div>

      {open && <InvoiceModal setDialogOpen={setOpen} />}
      {showAddProduct && (
        <AddProductModal setShowAddProduct={setShowAddProduct} />
      )}
    </header>
  );
}
