import React, { useEffect } from "react";
import Container from "../ui/Container";
import DashboardBox from "../ui/dashboard/DashboardBox";
import { DatePickerProps } from "antd";
import {
  useLazyGetFinancialSummaryQuery,
  useLazyGetPendingQuery,
  useLazyGetProfitsMonthQuery,
  useLazyGetProfitsPrevMonthQuery,
  useLazyGetProfitsQuarterQuery,
  useLazyGetProfitsTodayQuery,
  useLazyGetProfitsWeekQuery,
  useLazyGetProfitsYearQuery,
} from "../api/metrics";
import { formatAmount } from "../utils/format";
import { Link } from "react-router-dom";
import {
  useGetExpensePrevMonthQuery,
  useLazyGetExpensePrevMonthQuery,
  useLazyGetExpenseTodayQuery,
  useLazyGetExpenseWeekQuery,
} from "../api/expensesApi";

function Transactions() {
  const [getFinancialSummary, { data, isLoading }] =
    useLazyGetFinancialSummaryQuery();
  const [getProfitsToday, { data: todayData }] = useLazyGetProfitsTodayQuery();
  const [getProfitsWeek, { data: weekData }] = useLazyGetProfitsWeekQuery();
  const [getProfitsQuarter, { data: quarterData }] =
    useLazyGetProfitsQuarterQuery();
  const [getProfitsYear, { data: yearData }] = useLazyGetProfitsYearQuery();
  const [getProfitsMonth, { data: monthData }] = useLazyGetProfitsMonthQuery();

  const [getProfitsPrevMonth, { data: prevMonthData }] =
    useLazyGetProfitsPrevMonthQuery();
  useEffect(() => {
    getProfitsYear("");
    getProfitsYear("");
    getProfitsQuarter("");
    getProfitsWeek("");
    getProfitsToday("");
    getFinancialSummary("");
    getProfitsMonth("");
    getProfitsPrevMonth("");
  }, [
    getProfitsYear,
    getProfitsYear,
    getProfitsQuarter,
    getProfitsWeek,
    getProfitsToday,
    getFinancialSummary,
  ]);

  const [getPending, { data: pendingData }] = useLazyGetPendingQuery();

  useEffect(() => {
    getPending("");
  }, [getPending]);

  const totalAmountSum = pendingData?.sales.reduce(
    (sum, sale) => parseInt(sum) + parseInt(sale.amount),
    0
  );

  const totalPaidSum = pendingData?.sales.reduce(
    (sum, sale) => parseInt(sum) + parseInt(sale.amount_paid),
    0
  );

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
        <Link to="/dashboard/transactions/pending" className="w-[100%]">
          <DashboardBox
            title="Pending Payments"
            value={`${formatAmount(totalAmountSum - totalPaidSum) ?? 0}`}
          />
        </Link>
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
        <Link className="w-[100%]" to="/dashboard/transactions/history/quarter">
          <DashboardBox
            className=""
            title="Total Profit This Year"
            value={`${formatAmount(yearData?.totalProfit.totalProfit) ?? 0}`}
          />
        </Link>

        <Link
          className="w-[100%]"
          to="/dashboard/transactions/history/Previous month"
        >
          <DashboardBox
            className=""
            title="Total Profit Previous Month"
            value={`${formatAmount(prevMonthData?.totalProfit.totalProfit) ?? 0}`}
          />
        </Link>

        <DashboardBox
          className="w-[100%]"
          title="Stores Worth"
          value={`${formatAmount(data?.total_worth) ?? 0}`}
        />
      </Container>

      <p className="ml-[24px] text-[1.25rem] font-[500]">Extra Expenses</p>
      <Container className="flex flex-col gap-[24px] pb-[40px] md:flex-row">
        <Link className="w-[100%]" to="/dashboard/expenses/history/today">
          <DashboardBox
            className=""
            title="Total Expenses Today"
            value={`${formatAmount(expensesToday?.totalExpense.totalExpense) ?? 0}`}
          />
        </Link>
        <Link className="w-[100%]" to="/dashboard/expenses/history/week">
          <DashboardBox
            className=""
            title="Total Expenses This Week"
            value={`${formatAmount(weekExpense?.totalExpense.totalExpense) ?? 0}`}
          />
        </Link>
        <Link
          className="w-[100%]"
          to="/dashboard/expenses/history/Previous month"
        >
          <DashboardBox
            className=""
            title="Total Expenses Previous Month"
            value={`${formatAmount(prevMthExpenses?.totalExpense.totalExpense) ?? 0}`}
          />
        </Link>
      </Container>
    </div>
  );
}

export default Transactions;
