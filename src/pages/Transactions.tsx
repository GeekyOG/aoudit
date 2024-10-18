import React, { useEffect } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Container from "../ui/Container";
import DashboardBox from "../ui/dashboard/DashboardBox";
import { Download, ListFilter, Search } from "lucide-react";
import Button from "../ui/Button";
import { DatePicker, DatePickerProps, Popover } from "antd";
import { columns } from "../modules/transactions/columns";
import {
  useGetFinancialSummaryQuery,
  useGetProfitsQuarterQuery,
  useGetProfitsTodayQuery,
  useGetProfitsWeekQuery,
  useGetProfitsYearQuery,
  useLazyGetFinancialSummaryQuery,
  useLazyGetProfitsQuarterQuery,
  useLazyGetProfitsTodayQuery,
  useLazyGetProfitsWeekQuery,
  useLazyGetProfitsYearQuery,
} from "../api/metrics";
import { formatAmount } from "../utils/format";
import { Link } from "react-router-dom";

function Transactions() {
  const onChange: DatePickerProps["onChange"] = (date, dateString) => {};

  const [getFinancialSummary, { data, isLoading }] =
    useLazyGetFinancialSummaryQuery();
  const [getProfitsToday, { data: todayData }] = useLazyGetProfitsTodayQuery();
  const [getProfitsWeek, { data: weekData }] = useLazyGetProfitsWeekQuery();
  const [getProfitsQuarter, { data: quarterData }] =
    useLazyGetProfitsQuarterQuery();
  const [getProfitsYear, { data: yearData }] = useLazyGetProfitsYearQuery();

  useEffect(() => {
    getProfitsYear("");
    getProfitsYear("");
    getProfitsQuarter("");
    getProfitsWeek("");
    getProfitsToday("");
    getFinancialSummary("");
  }, [
    getProfitsYear,
    getProfitsYear,
    getProfitsQuarter,
    getProfitsWeek,
    getProfitsToday,
    getFinancialSummary,
  ]);
  return (
    <div>
      <Container>
        <h1 className="text-[1.45rem] font-[600] text-neutral-500 mb-[24px]">
          Transactions Overview
        </h1>
      </Container>
      <Container className="flex flex-col gap-[24px] pb-[40px] md:flex-row">
        <DashboardBox
          title="Total Expense"
          value={`${formatAmount(data?.total_expenses) ?? 0}`}
        />
        <DashboardBox
          title="Total Profit"
          value={`${formatAmount(data?.total_profit) ?? 0}`}
        />
        <DashboardBox
          title="Pending Payments"
          value={`${formatAmount(data?.total_pending_payments) ?? 0}`}
        />
      </Container>

      <Container className="flex flex-col gap-[24px] pb-[40px] md:flex-row">
        <Link className="lg:w-[32%]" to="/dashboard/transactions/history/today">
          <DashboardBox
            title="Total Profit Today"
            value={`${formatAmount(todayData?.totalProfit.totalProfit) ?? 0}`}
          />
        </Link>
        <Link className="lg:w-[32%]" to="/dashboard/transactions/history/week">
          <DashboardBox
            title="Total Profit This Week"
            value={`${formatAmount(weekData?.totalProfit.totalProfit) ?? 0}`}
          />
        </Link>

        <Link
          className="lg:w-[32%]"
          to="/dashboard/transactions/history/quarter"
        >
          <DashboardBox
            title="Total Profit This Quarter"
            value={`${formatAmount(quarterData?.totalProfit.totalProfit) ?? 0}`}
          />
        </Link>
      </Container>
      <Container className="flex flex-col gap-[24px] pb-[40px] md:flex-row">
        <Link
          className="lg:w-[32%]"
          to="/dashboard/transactions/history/quarter"
        >
          <DashboardBox
            className=""
            title="Total Profit This Year"
            value={`${formatAmount(yearData?.totalProfit.totalProfit) ?? 0}`}
          />
        </Link>

        <DashboardBox
          className="lg:w-[32%]"
          title="Stores Worth"
          value={`${formatAmount(data?.total_worth) ?? 0}`}
        />
      </Container>
    </div>
  );
}

export default Transactions;
