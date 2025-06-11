/* eslint-disable @next/next/no-img-element */

import clsx from "clsx";
import {
  ArrowLeftRight,
  LayoutGrid,
  Logs,
  MenuIcon,
  Receipt,
  ReceiptText,
  Store,
  UserCheck,
  Users,
} from "lucide-react";

import React, { useEffect, useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { IoArrowBackSharp } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
    text: "Order List",
    url: "/dashboard/orderlist",
    icon: <Store size={16} />,
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
    text: "Manage users",
    url: "/dashboard/users",
    icon: <Users size={16} />,
    slug: "create_user",
  },
  {
    test: "Audit log",
    url: "/dashboard/auditlog",
    icon: <Logs size={16} />,
    slug: "view_reports",
  },
];

const storedPermissions = localStorage.getItem("permissions");
const permissions = storedPermissions ? JSON.parse(storedPermissions) : null;
const permittedOverviewNavs = mainMenuOptions.filter((item) =>
  permissions?.some((permission) => permission.name === item.slug)
);

function MobileNav({ activeNav }: { activeNav?: string }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleClose = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="p-[20px] lg:hidden">
      <div className="flex justify-between items-center w-[100%]">
        <MenuIcon onClick={() => setShowMobileMenu(!showMobileMenu)} />

        <div
          className={clsx(
            "fixed right-0 left-0 top-0 bottom-0 bg-[#FFFFFF4E]",
            showMobileMenu ? "" : ""
          )}
          style={{
            zIndex: 100,
            position: "fixed",
            right: 0,
            left: 0,
            bottom: 0,
            top: 0,
            transform: `translateX(${showMobileMenu ? "0" : "-130vw"})`,
            transition: "all 0.5s ease-in-out ",
          }}
        >
          <div
            className={clsx(
              "z-40 flex flex-col bg-[#282830] w-[60%] border-r-[2px] border-secondary"
            )}
            style={{
              zIndex: 100,
              position: "fixed",
              right: 0,
              left: 0,
              bottom: 0,
              top: 0,
              transform: `translateX(${showMobileMenu ? "0" : "-130vh"})`,
              transition: "all 0.5s ease-in-out ",
              animationDelay: "2s",
            }}
          >
            <div className="flex justify-between px-[20px] py-[20px]">
              <div onClick={handleClose}>
                <IoArrowBackSharp className="text-[30px] text-[#fff]" />
              </div>
            </div>
            <div className="flex-col  items-start mt-[32px]">
              <div>
                {permittedOverviewNavs.map((option, index) => (
                  <Link
                    to={option.url}
                    key={index}
                    onClick={handleClose}
                    className={clsx(
                      "text-[#fff] font-[600] block py-[16px] px-[28px]",
                      option.url == location.pathname &&
                        "text-secondary_dark bg-secondary border-r-[8px] border-primary_dark"
                    )}
                  >
                    {option.text}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
