import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import { columns } from "../modules/products/stock-columns";
import { Popover, DatePicker } from "antd";
import { Download, ListFilter, PackageOpen, Search } from "lucide-react";
import dayjs from "dayjs";
import { useLazyGetStockReportQuery } from "../api/productApi";
import { handleExportStockCSV } from "../utils/export";

function OpeningStock() {
  const [getProduct, { isFetching: productsLoading, data: productsData }] =
    useLazyGetStockReportQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [hasDateFilter, setHasDateFilter] = useState(false);

  const stocks =
    typeof productsData?.openingStock === "string"
      ? JSON.parse(productsData.openingStock)
      : productsData?.openingStock || [];

  useEffect(() => {
    getProduct("");
  }, [getProduct]);

  const onChange = (date: any) => {
    getProduct(date);
    setHasDateFilter(!!date);
  };

  const filteredOptions = useMemo(() => {
    return stocks?.filter((item: any) =>
      item?.product_name?.toLowerCase().includes(searchTerm?.toLowerCase()),
    );
  }, [stocks, searchTerm]);

  const displayData = filteredOptions || [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <PackageOpen size={17} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Opening Stock</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {displayData.length} item{displayData.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            {/* Tab pill */}
            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
              Opening Stocks
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
                    fileName: "stocks.csv",
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
      </div>
    </div>
  );
}

export default OpeningStock;
