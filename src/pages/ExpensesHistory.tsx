import React, { useEffect, useState } from "react";
import Container from "../ui/Container";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import { Popover, DatePicker, DatePickerProps } from "antd";
import { Search, ListFilter, Download } from "lucide-react";
import { useLazyGetOrdersQuery } from "../api/ordersApi";
import { handleExportCSV } from "../utils/export";
import { cn } from "../utils/cn";
import moment from "moment";
import { useParams } from "react-router-dom";

import { columns } from "../modules/expenses/columns";
import AddExpense from "../modules/expenses/AddExpense";
import {
  useLazyGetExpensePrevMonthQuery,
  useLazyGetExpenseTodayQuery,
  useLazyGetExpenseWeekQuery,
} from "../api/expensesApi";
function ExpensesHistory() {
  const { period } = useParams<{ period: string }>();
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [activeTab, setTab] = useState("All");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [getOrders, { data: ordersData, isLoading, isError, isSuccess }] =
    useLazyGetOrdersQuery();

  // Fetch orders when the component mounts
  useEffect(() => {
    getOrders(""); // Fetch orders without filters initially
  }, [getOrders]);

  // Update fetched data once orders are successfully retrieved
  useEffect(() => {
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

  const [getExpensesToday, { data: expensesToday }] =
    useLazyGetExpenseTodayQuery();
  const [getExpensesPrevMonth, { data: prevMthExpenses }] =
    useLazyGetExpensePrevMonthQuery();
  const [getExpenseWeek, { data: weekExpense }] = useLazyGetExpenseWeekQuery();
  useEffect(() => {
    getExpensesToday("");
    getExpensesPrevMonth("");
    getExpenseWeek("");
  }, [getExpensesToday, getExpensesPrevMonth, getExpenseWeek]);

  useEffect(() => {
    let filteredData = ordersData;

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
                <p className="text-[0.865rem] capitalize">{tab}</p>
              </button>
            ))}
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="lg:flex hidden cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
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
            (period == "today" && expensesToday?.totalExpense.expenses) ||
            (period == "week" && weekExpense?.totalExpense?.expenses) ||
            (period == "Previous month" &&
              prevMthExpenses?.totalExpense?.expenses) ||
            []
          }
          isFetching={isLoading}
          action={() => getOrders("")}
          type={""}
        />
      </Container>

      <AddExpense open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default ExpensesHistory;
