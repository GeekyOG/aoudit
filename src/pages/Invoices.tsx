import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddInvoices from "../modules/invoices/AddInvoices";
import { Popover, DatePicker } from "antd";
import {
  Search,
  ListFilter,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Check,
} from "lucide-react";
import { useLazyGetOrdersQuery } from "../api/ordersApi";
import { columns } from "../modules/invoices/columns";
import { handleExportCSV } from "../utils/export";
import { cn } from "../utils/cn";
import moment from "moment";
import { useGetAdminUserQuery } from "../api/adminUsers";

const Tabs = ["All", "Completed", "Pending", "Returned", "Borrowed"];

const TAB_STYLES: Record<string, string> = {
  All: "data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 data-[active=true]:border-indigo-200",
  Completed:
    "data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700 data-[active=true]:border-emerald-200",
  Pending:
    "data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 data-[active=true]:border-amber-200",
  Returned:
    "data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-blue-200",
  Borrowed:
    "data-[active=true]:bg-purple-50 data-[active=true]:text-purple-700 data-[active=true]:border-purple-200",
};

function Invoices() {
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [activeTab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [soldBy, setSoldBy] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: adminUsers } = useGetAdminUserQuery("");
  const [getOrders, { data: ordersData, isFetching, isSuccess }] =
    useLazyGetOrdersQuery();

  const totalPages = ordersData?.pagination?.totalPages || 1;

  useEffect(() => {
    getOrders({
      page,
      limit,
      soldBy,
      search,
      startDate,
      endDate,
      ...(activeTab !== "All" ? { status: activeTab } : {}),
    });
  }, [getOrders, page, limit, activeTab, startDate, endDate, search, soldBy]);

  useEffect(() => {
    const sortByDateDesc = (a: any, b: any) =>
      moment(b.Sale.date).valueOf() - moment(a.Sale.date).valueOf();

    let filtered: any[] = Object.values(ordersData?.data ?? []).sort(
      sortByDateDesc,
    );

    if (activeTab !== "All") {
      filtered = filtered.filter(
        (item) => item.Sale.status === activeTab.toLowerCase(),
      );
    }
    if (startDate && endDate) {
      filtered = filtered.filter((item) =>
        moment(item.Sale.date).isBetween(startDate, endDate, undefined, "[]"),
      );
    }
    setFetchedData(filtered);
  }, [activeTab, startDate, endDate, ordersData, soldBy]);

  const onChange = (date: any, _: any, type: string) => {
    if (type === "start") setStartDate(date ? date.toDate() : null);
    else setEndDate(date ? date.toDate() : null);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FileText size={17} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {fetchedData.length} record{fetchedData.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-52"
                  placeholder="Name, product or IMEI..."
                />
              </div>

              {/* Filter Popover */}
              <Popover
                trigger="click"
                placement="bottomLeft"
                showArrow={false}
                content={
                  <div className="flex flex-col gap-4 p-3 w-[230px]">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Date Range
                      </p>
                      <div className="flex flex-col gap-2">
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
                      </div>
                    </div>

                    {adminUsers && adminUsers.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Sold By
                        </p>
                        <div className="flex flex-col gap-1">
                          {adminUsers.map((user: any) => {
                            const fullName = `${user.firstname} ${user.lastname}`;
                            const isSelected = soldBy === fullName;
                            return (
                              <button
                                key={user.id}
                                onClick={() =>
                                  setSoldBy(isSelected ? "" : fullName)
                                }
                                className={cn(
                                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left",
                                  isSelected
                                    ? "bg-indigo-50 text-indigo-700 font-medium"
                                    : "hover:bg-gray-50 text-gray-600",
                                )}
                              >
                                {fullName}
                                {isSelected && (
                                  <Check
                                    size={13}
                                    className="text-indigo-600"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm rounded-lg">
                      Apply Filter
                    </Button>
                  </div>
                }
              >
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                  <ListFilter size={14} />
                  Filter
                  {(startDate || endDate || soldBy) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              </Popover>
            </div>

            {/* Export */}
            <button
              onClick={() =>
                handleExportCSV({ data: fetchedData, fileName: "sales.csv" })
              }
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-all"
            >
              <Download size={14} />
              Export
            </button>
          </div>

          {/* Tabs */}
          <div className="px-5 py-3 border-b border-gray-100 flex gap-1 flex-wrap">
            {Tabs.map((tab) => (
              <button
                key={tab}
                data-active={activeTab === tab}
                onClick={() => {
                  setTab(tab);
                  setPage(1);
                }}
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
            data={fetchedData || []}
            isFetching={isFetching}
            action={() => getOrders({ page, limit })}
            type="orders"
            hidePagination
          />

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Page <span className="font-semibold text-gray-700">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddInvoices open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default Invoices;
