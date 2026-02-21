import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import { columns } from "../modules/products/stock-columns";
import { Popover, DatePicker } from "antd";
import {
  Clock,
  Download,
  ListFilter,
  PackageCheck,
  Search,
} from "lucide-react";
import dayjs from "dayjs";
import { useLazyGetStockReportQuery } from "../api/productApi";
import { handleExportStockCSV } from "../utils/export";

function ClosingStock() {
  const [getProduct, { isFetching: productsLoading, data: productsData }] =
    useLazyGetStockReportQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [hasDateFilter, setHasDateFilter] = useState(false);

  const stocks = productsData?.closingStock || [];
  const isAfter6PM = dayjs().hour() >= 18;

  useEffect(() => {
    if (isAfter6PM) getProduct("");
  }, [getProduct]);

  const onChange = (date: any) => {
    getProduct(date);
    setHasDateFilter(!!date);
  };

  const filteredOptions = useMemo(
    () =>
      stocks?.filter((item: any) =>
        item?.product_name?.toLowerCase().includes(searchTerm?.toLowerCase()),
      ),
    [stocks, searchTerm],
  );

  const displayData = filteredOptions || [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <PackageCheck size={17} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Closing Stock</h1>
            {isAfter6PM && (
              <p className="text-xs text-gray-400 mt-0.5">
                {displayData.length} item{displayData.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Time-restricted gate */}
        {!isAfter6PM ? (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock size={26} className="text-amber-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-800">
                Available from 6:00 PM
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Closing stock reports are only accessible after 6 PM. Please
                check back later.
              </p>
            </div>
            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              Current time: {dayjs().format("h:mm A")}
            </span>
          </div>
        ) : (
          /* Table Card */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">
                Closing Stocks
              </span>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-44"
                    placeholder="Search by name..."
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
                        onChange={(date) => onChange(date)}
                        placeholder="Select Date"
                        className="rounded-lg"
                        disabledDate={(current) =>
                          current && current > dayjs().endOf("day")
                        }
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
                    handleExportStockCSV({
                      data: filteredOptions,
                      fileName: "closing-stocks.csv",
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
              type=""
              action={() => {}}
              columns={columns}
              data={displayData}
              isFetching={productsLoading}
              callBackAction={() => getProduct("")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ClosingStock;
