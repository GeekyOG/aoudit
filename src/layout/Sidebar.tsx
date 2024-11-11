import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { DecodedData } from "../types/DecodedDataType";
import SidebarTab from "./SidebarTab";
import {
  ArrowLeftRight,
  LayoutGrid,
  LogOutIcon,
  Receipt,
  ReceiptText,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import Button from "../ui/Button";
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
];

function Sidebar() {
  const [permittedOverviewNavs, setPermittedOverviewNavs] = useState<
    {
      text: string;
      url: string;
      icon: React.JSX.Element;
      slug: string;
    }[]
  >([]);
  const [user] = useState(Cookies.get("authToken"));
  const [decodedData, setDecodedData] = useState<DecodedData>();

  const location = useLocation();
  const { pathname } = location;

  // Retrieve permissions from local storage
  const storedPermissions = localStorage.getItem("permissions");
  const permissions = storedPermissions ? JSON.parse(storedPermissions) : null;

  const userData = JSON.parse(localStorage.getItem("user") ?? "");

  // Filter permitted menu items based on user's permissions
  useEffect(() => {
    if (permissions) {
      const navs = mainMenuOptions.filter((item) =>
        permissions.some(
          (permission: { name: string }) => permission.name === item.slug
        )
      );
      setPermittedOverviewNavs(navs);
    }
  }, []); // Use permissions as a dependency

  // Decode JWT token and set user data
  useEffect(() => {
    if (user) {
    }
  }, [user]); // User as dependency to avoid re-running on every render

  return (
    <div className="hidden h-[100vh] w-[250px] flex-none border-r-[1px] lg:block overflow-y-scroll bg-[#282830] no-scrollbar">
      <div className=" fixed bottom-0 top-0 overflow-y-scroll w-[250px] bg-[#282830]">
        <div className="border-b-[1px] px-[28px] pb-[20px] pt-[24px]"></div>

        <div className="border-b-[1px] px-[20px] py-[17px]">
          <div className="flex h-[76px] w-[100%] items-center gap-[8px] rounded-[12px] px-[12px]">
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[50%] bg-[#fff]">
              <p className="text-[1.25rem] font-[700] text-[#000]">
                {userData.firstname.slice(0, 1)} {userData.lastname.slice(0, 1)}
              </p>
            </div>
            <div>
              <p className="text-[0.75rem] font-[500] text-[#fff]">
                {userData.firstname} {userData.lastname}
              </p>
            </div>
          </div>
        </div>
        <div className="border-b-[1px] pb-[10px] text-neutral-100">
          <div className="px-[28px] py-[14px]">
            <p className="text-[0.625rem] font-[700]">MAIN MENU</p>
          </div>
          {permittedOverviewNavs?.map((item) => (
            <SidebarTab
              key={item.text}
              item={item.text}
              activeOption={pathname}
              url={item.url}
              icon={item.icon}
            />
          ))}
          <div className="bottom-5 ml-[24px] mt-auto text-[#fff]">
            <Button
              className="flex items-center gap-[10px] bg-transparent"
              onClick={() => logout()}
            >
              <LogOutIcon size={16} />
              <p className="text-[0.813rem] leading-[22.4px]">Logout</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
