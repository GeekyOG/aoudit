import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import { ListFilter, Plus, Receipt, Search } from "lucide-react";
import { columns } from "../modules/expenses/columns";
import { DatePicker, Popover } from "antd";
import AddExpense from "../modules/expenses/AddExpense";
import { useLazyGetExpenseQuery } from "../api/expensesApi";
import moment from "moment";

function Expenses() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [getExpenses, { data: expenses, isLoading }] = useLazyGetExpenseQuery();

  useEffect(() => {
    getExpenses("");
  }, [getExpenses]);

  useEffect(() => {
    let filtered = expenses;
    if (startDate && endDate) {
      filtered = filtered?.filter((item: any) =>
        moment(item.date).isBetween(startDate, endDate, undefined, "[]"),
      );
    }
    setFetchedData(filtered ?? []);
  }, [startDate, endDate, expenses]);

  const onChange = (date: any, _: any, type: string) => {
    if (type === "start") setStartDate(date ? date.toDate() : null);
    else setEndDate(date ? date.toDate() : null);
  };

  const filteredOptions = useMemo(
    () =>
      fetchedData?.filter((item: any) =>
        item?.spentOn?.toLowerCase().includes(searchTerm?.toLowerCase()),
      ),
    [fetchedData, searchTerm],
  );

  const displayData = filteredOptions || fetchedData || [];
  const hasDateFilter = !!(startDate || endDate);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <Receipt size={17} className="text-rose-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {displayData.length} record{displayData.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-sm rounded-xl h-9 px-4 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={15} />
            Add Expense
          </Button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-sm font-medium">
                All Expenses
              </span>
              {!isLoading && (
                <span className="text-xs text-gray-400 font-medium">
                  {displayData.length} result
                  {displayData.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-48"
                  placeholder="Search by description..."
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
          </div>

          {/* Table */}
          <DashboardTable
            columns={columns}
            data={displayData}
            isFetching={isLoading}
            action={() => {}}
            type="expenses"
          />
        </div>
      </div>

      <AddExpense open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default Expenses;
