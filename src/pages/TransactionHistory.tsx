import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddInvoices from "../modules/invoices/AddInvoices";
import { Popover, DatePicker } from "antd";
import {
  Search,
  ListFilter,
  Download,
  ArrowLeftRight,
  TrendingUp,
} from "lucide-react";
import { handleExportCSV } from "../utils/export";
import moment from "moment";
import { useParams } from "react-router-dom";
import {
  useLazyGetAllSalesQuery,
  useLazyGetProfitsPrevMonthQuery,
  useLazyGetProfitsQuarterQuery,
  useLazyGetProfitsTodayQuery,
  useLazyGetProfitsWeekQuery,
  useLazyGetProfitsYearQuery,
  useLazyGetProfitsCustomQuery,
} from "../api/metrics";
import { columns } from "../modules/transactions/historyColumn";
import { formatAmount } from "../utils/format";

const sortByDate = (arr: any[]) =>
  [...arr].sort((a, b) => (moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1));

const getSalesFromData = (data: any) =>
  data?.totalProfit?.sales
    ? sortByDate(Object.values(data.totalProfit.sales))
    : null;

function TransactionHistory() {
  const { period } = useParams<{ period: string }>();
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [getOrders, { data: ordersData, isLoading, isSuccess }] =
    useLazyGetAllSalesQuery();
  const [getProfitsToday, { data: todayData }] = useLazyGetProfitsTodayQuery();
  const [getProfitsWeek, { data: weekData }] = useLazyGetProfitsWeekQuery();
  const [getProfitsQuarter, { data: quarterData }] =
    useLazyGetProfitsQuarterQuery();
  const [getProfitsYear, { data: yearData }] = useLazyGetProfitsYearQuery();
  const [getProfitsPrevMonth, { data: prevMonthData }] =
    useLazyGetProfitsPrevMonthQuery();
  const [getCustomProfits, { data: customData }] =
    useLazyGetProfitsCustomQuery();

  useEffect(() => {
    getOrders("");
  }, []);

  useEffect(() => {
    if (isSuccess && ordersData) setFetchedData(ordersData);
  }, [isSuccess, ordersData]);

  useEffect(() => {
    if (startDate && endDate) getCustomProfits({ startDate, endDate });
    else if (period === "today") getProfitsToday("");
    else if (period === "week") getProfitsWeek("");
    else if (period === "quarter") getProfitsQuarter("");
    else if (period === "year") getProfitsYear("");
    else if (period === "Previous month") getProfitsPrevMonth("");
    else getOrders("");
  }, [period, startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate && customData) {
      const custom = getSalesFromData(customData);
      if (custom) setFetchedData(custom);
    } else {
      setFetchedData(sortByDate(Object.values(ordersData ?? [])));
    }
  }, [startDate, endDate, ordersData, customData]);

  const onChange = (date: any, _: any, type: string) => {
    if (type === "start") setStartDate(date ? date.toDate() : null);
    else setEndDate(date ? date.toDate() : null);
  };

  const baseData = useMemo(() => {
    const periodData =
      period === "today"
        ? todayData
        : period === "week"
          ? weekData
          : period === "quarter"
            ? quarterData
            : period === "year"
              ? yearData
              : period === "Previous month"
                ? prevMonthData
                : null;
    return getSalesFromData(periodData) ?? fetchedData ?? [];
  }, [
    period,
    todayData,
    weekData,
    quarterData,
    yearData,
    prevMonthData,
    fetchedData,
  ]);

  const filteredOptions = useMemo(() => {
    const source = startDate && endDate ? fetchedData : baseData;
    if (!searchTerm) return source;
    const lower = searchTerm.toLowerCase();
    return source.filter(
      (item: any) =>
        (item?.Sale?.Customer?.first_name ?? "")
          .toLowerCase()
          .includes(lower) ||
        (item?.Product?.product_name ?? "").toLowerCase().includes(lower) ||
        (item?.serial_number ?? "").toLowerCase().includes(lower),
    );
  }, [baseData, fetchedData, searchTerm, startDate, endDate]);

  const displayData = filteredOptions.length > 0 ? filteredOptions : baseData;

  const totalProfit = displayData.reduce(
    (sum: number, item: any) =>
      sum + (item.amount_paid - (item.Product?.purchase_amount || 0)),
    0,
  );

  const periodLabel =
    period === "today"
      ? "Today"
      : period === "week"
        ? "This Week"
        : period === "quarter"
          ? "This Quarter"
          : period === "year"
            ? "This Year"
            : period === "Previous month"
              ? "Previous Month"
              : "All Time";

  const hasDateFilter = !!(startDate || endDate);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ArrowLeftRight size={17} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Transaction History
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{periodLabel}</p>
          </div>
        </div>

        {/* Profit Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Profit — {periodLabel}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {formatAmount(totalProfit)}
            </p>
          </div>
          <div className="ml-auto text-xs text-gray-400">
            {displayData.length} transaction
            {displayData.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
              {periodLabel}
            </span>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-48"
                  placeholder="Customer, product or IMEI..."
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
                      Custom Date Range
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

              {/* Export */}
              <button
                onClick={() =>
                  handleExportCSV({
                    data: displayData,
                    fileName: "transactions.csv",
                  })
                }
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-all"
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <DashboardTable
            columns={columns}
            data={displayData}
            isFetching={isLoading}
            action={() => getOrders("")}
            type=""
          />
        </div>
      </div>

      <AddInvoices open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default TransactionHistory;
