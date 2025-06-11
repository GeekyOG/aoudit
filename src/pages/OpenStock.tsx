import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { columns } from "../modules/products/stock-columns";
import { Popover, DatePicker, DatePickerProps } from "antd";
import { Download, ListFilter, Search } from "lucide-react";
import { cn } from "../utils/cn";
import dayjs from "dayjs";
import {
  useLazyGetProductsQuery,
  useLazyGetStockReportQuery,
} from "../api/productApi";

import { handleExportCSV, handleExportStockCSV } from "../utils/export";

const Tabs = ["Opening Stocks"];

function OpeningStock() {
  const [
    getProduct,
    { isFetching: productsLoading, data: productsData, isSuccess },
  ] = useLazyGetStockReportQuery();

  const stocks =
    typeof productsData?.openingStock === "string"
      ? JSON.parse(productsData.openingStock)
      : productsData?.openingStock || [];

  useEffect(() => {
    getProduct("");
  }, [getProduct]);

  const [activeTab, setActiveTab] = useState(Tabs[0]);
  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const onChange = (date) => {
    getProduct(date);
  };

  const handleGetProducts = () => {
    getProduct("");
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return stocks?.filter((item) =>
      item?.product_name?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }, [stocks, searchTerm]);

  return (
    <div>
      <div>
        <Container className="flex items-center justify-between">
          <div className="flex gap-[5px]">
            {Tabs.map((tab, i) => (
              <div
                onClick={() => handleActiveTab(tab)}
                key={i}
                className={cn(
                  "border-[1px] px-[15px] py-[8px] text-[0.865rem] cursor-pointer",
                  tab === activeTab && "font-[600] text-secondary-600"
                )}
              >
                <p>{tab}</p>
              </div>
            ))}
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="flex cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by name..."
              />
              <Popover
                content={
                  <div className="flex flex-col gap-3 px-[4px] py-[16px]">
                    <DatePicker
                      onChange={(date) => onChange(date)}
                      placeholder="Select Date"
                      disabledDate={(current) => {
                        // Disable dates AFTER today
                        return current && current > dayjs().endOf("day");
                      }}
                    />

                    <Button className="items-center gap-3 bg-[#093aa4] text-[0.865rem]">
                      Apply
                    </Button>
                  </div>
                }
                title=""
                placement="bottomLeft"
                showArrow={false}
              >
                <div className="flex cursor-pointer items-center gap-[3px] rounded-md px-[8px] py-[8px] text-neutral-300 hover:text-[#093aa4]">
                  <ListFilter size={16} className="" />
                  <p className="text-[0.865rem]">Filter</p>
                </div>
              </Popover>

              <Button
                className="flex items-center gap-3 bg-[#a40909] text-[0.865rem]  h-[36px]"
                onClick={() =>
                  handleExportStockCSV({
                    data: filteredOptions,
                    fileName: "stocks.csv",
                  })
                }
              >
                <p>Export</p>
                <Download size={16} />
              </Button>
            </div>
          </div>
        </Container>
      </div>
      <Container>
        <DashboardTable
          type=""
          action={() => {}}
          columns={columns}
          data={filteredOptions || []}
          isFetching={productsLoading}
          callBackAction={handleGetProducts}
        />
      </Container>
    </div>
  );
}

export default OpeningStock;
