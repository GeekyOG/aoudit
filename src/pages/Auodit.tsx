import React, { useEffect, useMemo, useState } from "react";
import { ListFilter, Logs, Search } from "lucide-react";
import { DatePicker, Popover } from "antd";
import Button from "../ui/Button";
import DashboardTable from "../components/dashboard/DashboardTable";
import { columns } from "../modules/audit/columns";
import { useGetAuditsQuery } from "../api/audit";
import moment from "moment";
import { cn } from "../utils/cn";

const MODEL_TABS = ["All", "Product", "Sale"];

const TAB_STYLES: Record<string, string> = {
  All: "data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 data-[active=true]:border-indigo-200",
  Product:
    "data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700 data-[active=true]:border-emerald-200",
  Sale: "data-[active=true]:bg-purple-50 data-[active=true]:text-purple-700 data-[active=true]:border-purple-200",
};

function Audit() {
  const [activeTab, setTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: ordersData, isLoading } = useGetAuditsQuery("");

  const onChange = (date: any, _: any, type: string) => {
    if (type === "start") setStartDate(date ? date.toDate() : null);
    else setEndDate(date ? date.toDate() : null);
  };

  useEffect(() => {
    const sorted: any[] = Object.values(ordersData ?? []).sort(
      (a: any, b: any) => (moment(b.timestamp).isBefore(a.timestamp) ? -1 : 1),
    );

    let filtered = sorted;

    if (activeTab !== "All") {
      filtered = filtered.filter(
        (item) => item.model?.toLowerCase() === activeTab.toLowerCase(),
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((item) =>
        moment(item.timestamp).isBetween(startDate, endDate, undefined, "[]"),
      );
    }

    setFetchedData(filtered);
  }, [activeTab, startDate, endDate, ordersData]);

  const filteredOptions = useMemo(
    () =>
      fetchedData?.filter(
        (item) =>
          item?.changedBy?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
          item?.description?.toLowerCase().includes(searchTerm?.toLowerCase()),
      ),
    [fetchedData, searchTerm],
  );

  const displayData = filteredOptions || fetchedData || [];
  const hasDateFilter = !!(startDate || endDate);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Logs size={17} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {displayData.length} record{displayData.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-52"
                placeholder="Search by name or description..."
              />
            </div>

            {/* Date Filter */}
            <Popover
              trigger="click"
              placement="bottomRight"
              showArrow={false}
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
            >
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                <ListFilter size={14} />
                Filter
                {hasDateFilter && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            </Popover>
          </div>

          {/* Model Tabs */}
          <div className="px-5 py-3 border-b border-gray-100 flex gap-1 flex-wrap">
            {MODEL_TABS.map((tab) => (
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
            data={displayData}
            isFetching={isLoading}
            action={() => {}}
            type="audit"
          />
        </div>
      </div>
    </div>
  );
}

export default Audit;
