import React, { useEffect, useMemo, useState } from "react";
import Container from "../ui/Container";
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
} from "lucide-react";
import { useLazyGetOrdersQuery } from "../api/ordersApi";
import { columns } from "../modules/invoices/columns";
import { handleExportCSV } from "../utils/export";
import { cn } from "../utils/cn";
import moment from "moment";
function Invoices() {
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [activeTab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [getOrders, { data: ordersData, isFetching, isSuccess }] =
    useLazyGetOrdersQuery();

  const totalPages = ordersData?.pagination?.totalPages || 1;

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  // Fetch orders when the component mounts
  useEffect(() => {
    if (activeTab == "All") {
      getOrders({
        page,
        limit,
        startDate,
        endDate,
        search,
      });
    } else {
      getOrders({
        page,
        limit,
        status: activeTab,
        startDate,
        endDate,
        search,
      });
    }

    // Fetch orders without filters initially
  }, [getOrders, page, limit, activeTab, startDate, endDate, search]);

  // Update fetched data once orders are successfully retrieved
  useEffect(() => {
    if (isSuccess && ordersData) {
      const sortedResult = Object.values(ordersData?.data ?? []).sort(
        (a: any, b: any) =>
          moment(b.Sale.date).valueOf() - moment(a.Sale.date).valueOf()
      );

      setFetchedData(sortedResult); // Set the fetched orders
    }
  }, [isSuccess, ordersData]);

  // Handle tab switching and filtering based on the status

  const Tabs = ["All", "Completed", "Pending", "Returned", "Borrowed"];

  const onChange = (date, dateString, type) => {
    if (type === "start") {
      setStartDate(date ? date.toDate() : null);
    } else {
      setEndDate(date ? date.toDate() : null);
    }
  };
  useEffect(() => {
    const sortByDateDesc = (a: any, b: any) =>
      moment(b.Sale.date).valueOf() - moment(a.Sale.date).valueOf();

    let filteredData: any[] = Object.values(ordersData?.data ?? []).sort(
      sortByDateDesc
    );

    // Filter by status
    if (activeTab !== "All") {
      filteredData = filteredData
        .filter((item) => item.Sale.status === activeTab.toLowerCase())
        .sort(sortByDateDesc);
    }

    // Filter by date range
    if (startDate && endDate) {
      filteredData = filteredData
        .filter((item) => {
          const date = moment(item.Sale.date);
          return date.isBetween(startDate, endDate, undefined, "[]"); // inclusive range
        })
        .sort(sortByDateDesc);
    }

    setFetchedData(filteredData);
  }, [activeTab, startDate, endDate, ordersData]);

  return (
    <div>
      <div className="">
        <Container className="flex items-center justify-between">
          <div className="flex gap-[5px]">
            {Tabs.map((tab, i) => (
              <button
                onClick={() => setTab(tab)}
                key={i}
                className={cn(
                  `rounded-tl-[4px] rounded-tr-[4px] border-[1px] border-b-0 px-[8px] py-[8px] `,
                  activeTab === tab
                    ? "font-[600] text-secondary-600"
                    : "text-neutral-300"
                )}
              >
                <p className="text-[0.865rem] ">{tab}</p>
              </button>
            ))}
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="lg:flex hidden cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearch(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Enter name, product name or imie"
              />
            </div>

            <Popover
              content={
                <div className="flex flex-col gap-3 px-[4px] py-[16px]">
                  <DatePicker
                    onChange={(date, dateString) =>
                      onChange(date, dateString, "start")
                    }
                    placeholder="Start Date"
                  />
                  <DatePicker
                    onChange={(date, dateString) =>
                      onChange(date, dateString, "end")
                    }
                    placeholder="End Date"
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
                handleExportCSV({ data: fetchedData, fileName: "sales.csv" })
              }
            >
              <p>Export</p>
              <Download size={16} />
            </Button>
          </div>
        </Container>
      </div>
      <Container>
        <DashboardTable
          columns={columns}
          data={fetchedData || []}
          isFetching={isFetching}
          action={() => getOrders({ page, limit })}
          type={"orders"}
          hidePagination
        />
        <div className="mt-6 flex justify-between items-center max-w-[200px]">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-2 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-2 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </Container>

      <AddInvoices open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default Invoices;
