import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddInvoices from "../modules/invoices/AddInvoices";
import { Popover, DatePicker } from "antd";
import {
  Search,
  ListFilter,
  Download,
  Mail,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { useLazyGetOrdersQuery } from "../api/ordersApi";
import { columns } from "../modules/customers/customerOrdersColumn";
import { handleExportCSV } from "../utils/export";
import { cn } from "../utils/cn";
import moment from "moment";
import { useParams } from "react-router-dom";
import {
  useLazyGetAllCustomerOrdersQuery,
  useLazyGetCustomerQuery,
} from "../api/customerApi";
import DataLoading from "../ui/DataLoading";

const Tabs = ["All", "Completed", "Pending", "Returned", "Borrowed"];

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
];

const TAB_STYLES: Record<string, string> = {
  Completed:
    "data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700 data-[active=true]:border-emerald-200",
  Pending:
    "data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 data-[active=true]:border-amber-200",
  Returned:
    "data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-blue-200",
  Borrowed:
    "data-[active=true]:bg-purple-50 data-[active=true]:text-purple-700 data-[active=true]:border-purple-200",
  All: "data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 data-[active=true]:border-indigo-200",
};

const getInitials = (first: string, last: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

function CustomersOrders() {
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [activeTab, setTab] = useState("All");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { id } = useParams<{ id: string }>();

  const [getOrder, { data: ordersData, isLoading, isSuccess }] =
    useLazyGetAllCustomerOrdersQuery();
  const [getOrders] = useLazyGetOrdersQuery();
  const [getCustomer, { data, isLoading: customerLoading }] =
    useLazyGetCustomerQuery();

  useEffect(() => {
    getOrder(id);
  }, [getOrders, getOrder]);
  useEffect(() => {
    if (isSuccess && ordersData) setFetchedData(ordersData);
  }, [isSuccess, ordersData]);
  useEffect(() => {
    if (id) getCustomer(id);
  }, [id]);

  const onChange = (date: any, _: any, type: string) => {
    if (type === "start") setStartDate(date ? date.toDate() : null);
    else setEndDate(date ? date.toDate() : null);
  };

  useEffect(() => {
    let filtered = ordersData;
    if (activeTab !== "All") {
      filtered = filtered?.filter(
        (item: any) => item.Sale.status === activeTab.toLowerCase(),
      );
    }
    if (startDate && endDate) {
      filtered = filtered?.filter((item: any) =>
        moment(item.createdAt).isBetween(startDate, endDate, undefined, "[]"),
      );
    }
    setFetchedData(filtered);
  }, [activeTab, startDate, endDate, ordersData]);

  const filteredOptions = useMemo(
    () =>
      fetchedData?.filter((item: any) =>
        item?.Product.product_name
          ?.toLowerCase()
          .includes(searchTerm?.toLowerCase()),
      ),
    [fetchedData, searchTerm],
  );

  const fullName = `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {customerLoading && (
        <div className="flex items-center justify-center h-[80vh]">
          <DataLoading />
        </div>
      )}

      {data && !customerLoading && (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400" />
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div
                  className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0",
                    getAvatarColor(data?.first_name ?? ""),
                  )}
                >
                  {getInitials(data?.first_name, data?.last_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">
                        {fullName}
                      </h1>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      Customer
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    {data?.email && (
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail size={13} className="text-gray-400" />
                        {data.email}
                      </span>
                    )}
                    {data?.phone_number && (
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone size={13} className="text-gray-400" />
                        {data.phone_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase History Table Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-gray-400" />
                <h2 className="text-[15px] font-semibold text-gray-900">
                  Purchase History
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 transition-colors">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-40"
                    placeholder="Search products..."
                  />
                </div>

                {/* Filter */}
                <Popover
                  content={
                    <div className="flex flex-col gap-3 p-3 w-[220px]">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Filter by Date
                      </p>
                      <DatePicker
                        onChange={(date, ds) => onChange(date, ds, "start")}
                        placeholder="Start Date"
                        className="rounded-lg"
                      />
                      <DatePicker
                        onChange={(date, ds) => onChange(date, ds, "end")}
                        placeholder="End Date"
                        className="rounded-lg"
                      />
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm rounded-lg">
                        Apply Filter
                      </Button>
                    </div>
                  }
                  placement="bottomRight"
                  showArrow={false}
                  trigger="click"
                >
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                    <ListFilter size={14} />
                    Filter
                  </button>
                </Popover>

                {/* Export */}
                <button
                  onClick={() =>
                    handleExportCSV({
                      data: fetchedData,
                      fileName: "sales.csv",
                    })
                  }
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-all"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-5 py-3 border-b border-gray-100 flex gap-1 flex-wrap">
              {Tabs.map((tab) => (
                <button
                  key={tab}
                  data-active={activeTab === tab}
                  onClick={() => setTab(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    "border-transparent text-gray-500 hover:bg-gray-50",
                    TAB_STYLES[tab],
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table */}
            <DashboardTable
              columns={columns}
              data={filteredOptions || fetchedData || []}
              isFetching={isLoading}
              action={() => getOrders("")}
              type="orders"
            />
          </div>
        </div>
      )}

      <AddInvoices open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default CustomersOrders;
