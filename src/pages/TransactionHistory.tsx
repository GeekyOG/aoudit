import React, { useEffect, useMemo, useState } from "react";
import Container from "../ui/Container";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddInvoices from "../modules/invoices/AddInvoices";
import { Popover, DatePicker, DatePickerProps } from "antd";
import { Search, ListFilter, Download } from "lucide-react";
import { handleExportCSV } from "../utils/export";
import { cn } from "../utils/cn";
import moment from "moment";
import { useParams } from "react-router-dom";
import {
  useLazyGetAllSalesQuery,
  useLazyGetProfitsPrevMonthQuery,
  useLazyGetProfitsQuarterQuery,
  useLazyGetProfitsTodayQuery,
  useLazyGetProfitsWeekQuery,
  useLazyGetProfitsYearQuery,
} from "../api/metrics";
import { columns } from "../modules/transactions/historyColumn";
import { formatAmount } from "../utils/format";
function TransactionHistory() {
  const { period } = useParams<{ period: string }>();
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [activeTab, setTab] = useState("All");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [getOrders, { data: ordersData, isLoading, isError, isSuccess }] =
    useLazyGetAllSalesQuery();

  // Update fetched data once orders are successfully retrieved
  useEffect(() => {
    getOrders("");
    if (isSuccess && ordersData) {
      setFetchedData(ordersData); // Set the fetched orders
    }
  }, [isSuccess, ordersData]);

  // Handle tab switching and filtering based on the status

  const Tabs = [`All ${period == "today" ? period : `this ${period}`}`];

  const onChange = (date, dateString, type) => {
    if (type === "start") {
      setStartDate(date ? date.toDate() : null);
    } else {
      setEndDate(date ? date.toDate() : null);
    }
  };

  const [getProfitsToday, { data: todayData }] = useLazyGetProfitsTodayQuery();
  const [getProfitsWeek, { data: weekData }] = useLazyGetProfitsWeekQuery();
  const [getProfitsQuarter, { data: quarterData }] =
    useLazyGetProfitsQuarterQuery();
  const [getProfitsYear, { data: yearData }] = useLazyGetProfitsYearQuery();
  const [getProfitsPrevMonth, { data: prevMonthData }] =
    useLazyGetProfitsPrevMonthQuery();
  useEffect(() => {
    if (period === "today") {
      getProfitsToday("");
    } else if (period === "week") {
      getProfitsWeek("");
    } else if (period === "quarter") {
      getProfitsQuarter("");
    } else if (period === "year") {
      getProfitsYear("");
    } else if (period === "Previous month") {
      getProfitsPrevMonth("");
    } else {
      getOrders(""); // fallback if period is unknown or you want to fetch all orders
    }
  }, [
    period,
    getProfitsToday,
    getProfitsWeek,
    getProfitsQuarter,
    getProfitsYear,
    getProfitsPrevMonth,
    getOrders,
  ]);

  useEffect(() => {
    const sortedResult: any = Object.values(ordersData ?? []).sort(
      (a: any, b: any) => {
        return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
      }
    );
    let filteredData = sortedResult;

    // Filter by status
    if (activeTab !== "All") {
      filteredData = filteredData?.filter((item) => {
        return item.Sale.status === activeTab.toLowerCase();
      });
    }

    // Filter by date
    if (startDate && endDate) {
      filteredData = filteredData?.filter((item) => {
        const createdAt = moment(item.Sale.date);
        return createdAt.isBetween(startDate, endDate, undefined, "[]");
      });
    }

    setFetchedData(filteredData);
  }, [activeTab, startDate, endDate, ordersData]);

  const [searchTerm, setSearchTerm] = useState("");

  let tableData: any[] = [];

  if (period === "today" && todayData?.totalProfit?.sales) {
    tableData = Object.values(todayData.totalProfit.sales ?? []).sort(
      (a: any, b: any) => {
        return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
      }
    );
  } else if (period === "week" && weekData?.totalProfit?.sales) {
    tableData = Object.values(weekData.totalProfit.sales ?? []).sort(
      (a: any, b: any) => {
        return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
      }
    );
  } else if (period === "quarter" && quarterData?.totalProfit?.sales) {
    tableData = Object.values(quarterData.totalProfit.sales ?? []).sort(
      (a: any, b: any) => {
        return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
      }
    );
  } else if (period === "year" && yearData?.totalProfit?.sales) {
    tableData = Object.values(yearData.totalProfit.sales ?? []).sort(
      (a: any, b: any) => {
        return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
      }
    );
  } else if (period === "Previous month" && prevMonthData?.totalProfit?.sales) {
    tableData = Object.values(prevMonthData.totalProfit.sales ?? []).sort(
      (a: any, b: any) => {
        return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
      }
    );
  } else {
    tableData = fetchedData || [];
  }

  const baseData = useMemo(() => {
    if (period === "today" && todayData?.totalProfit?.sales) {
      return Object.values(todayData.totalProfit.sales ?? []).sort(
        (a: any, b: any) => {
          return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
        }
      );
    } else if (period === "week" && weekData?.totalProfit?.sales) {
      return Object.values(weekData.totalProfit.sales ?? []).sort(
        (a: any, b: any) => {
          return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
        }
      );
    } else if (period === "quarter" && quarterData?.totalProfit?.sales) {
      return Object.values(quarterData.totalProfit.sales ?? []).sort(
        (a: any, b: any) => {
          return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
        }
      );
    } else if (period === "year" && yearData?.totalProfit?.sales) {
      return Object.values(yearData.totalProfit.sales ?? []).sort(
        (a: any, b: any) => {
          return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
        }
      );
    } else if (
      period === "Previous month" &&
      prevMonthData?.totalProfit?.sales
    ) {
      return Object.values(prevMonthData.totalProfit.sales ?? []).sort(
        (a: any, b: any) => {
          return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
        }
      );
    } else {
      return fetchedData || [];
    }
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
    if (!searchTerm) return baseData;

    const sortedResult: any = Object.values(baseData ?? []).sort(
      (a: any, b: any) => {
        return moment(b.Sale.date).isBefore(a.Sale.date) ? -1 : 1;
      }
    );

    return sortedResult?.filter((item) => {
      const customerName = item?.Sale?.Customer?.first_name || "";
      const productName = item?.Product?.product_name || "";
      const imei = item?.serial_number || "";

      const lowerSearch = searchTerm.toLowerCase();

      return (
        customerName.toLowerCase().includes(lowerSearch) ||
        productName.toLowerCase().includes(lowerSearch) ||
        imei.toLowerCase().includes(lowerSearch)
      );
    });
  }, [baseData, searchTerm, fetchedData]);

  const dataToUse = startDate && endDate ? fetchedData : filteredOptions || [];

  const totalPurchaseAmount = dataToUse.reduce((sum, item) => {
    return sum + (item.amount - (item.Product?.purchase_amount || 0));
  }, 0);

  return (
    <div>
      <div className="">
        <Container>
          <h1 className="text-[1rem] font-[700] text-neutral-500">
            SUM TOTAL: {formatAmount(totalPurchaseAmount)}
          </h1>
        </Container>
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
                <p className="text-[0.865rem] capitalize">{tab}</p>
              </button>
            ))}
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="lg:flex hidden cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by name..."
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
          data={
            startDate && endDate
              ? fetchedData
              : filteredOptions.length > 0
                ? filteredOptions
                : tableData
          }
          isFetching={isLoading}
          action={() => getOrders("")}
          type=""
        />
      </Container>

      <AddInvoices open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default TransactionHistory;
