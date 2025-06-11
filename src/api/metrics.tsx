import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const metricsApi = createApi({
  baseQuery,
  reducerPath: "metricsApi",
  endpoints: (builder) => ({
    getMetrics: builder.query({
      query: () => ({
        url: "/counts",
      }),
    }),

    getFinancialSummary: builder.query({
      query: () => ({
        url: "/counts/financial-summary",
      }),
    }),

    getPending: builder.query({
      query: () => ({
        url: "/profits/pending",
      }),
    }),

    getAllSales: builder.query({
      query: () => ({
        url: "/profits/all",
      }),
    }),

    // For custom date range:
    // GET /api/sales/profit?startDate=2024-01-01&endDate=2024-01-31
    getProfitsToday: builder.query({
      query: () => ({
        url: "/profits?filter=day",
      }),
    }),

    getProfitsWeek: builder.query({
      query: () => ({
        url: "/profits?filter=week",
      }),
    }),

    getProfitsQuarter: builder.query({
      query: () => ({
        url: "/profits?filter=quarter",
      }),
    }),

    getProfitsMonth: builder.query({
      query: () => ({
        url: "/profits?filter=month",
      }),
    }),

    getProfitsPrevMonth: builder.query({
      query: () => ({
        url: "/profits?filter=previousMonth",
      }),
    }),

    getProfitsYear: builder.query({
      query: () => ({
        url: "/profits?filter=year",
      }),
    }),

    getSerialNumbers: builder.query({
      query: () => ({
        url: "/serial-numbers",
      }),
    }),

    getProfitsCustom: builder.query({
      query: ({ startDate, endDate }) => ({
        url: `/profits?startDate=${startDate}&endDate=${endDate}`,
      }),
    }),
  }),
});

export const {
  useGetMetricsQuery,
  useGetFinancialSummaryQuery,
  useGetProfitsCustomQuery,
  useGetProfitsQuarterQuery,
  useGetProfitsTodayQuery,
  useGetProfitsWeekQuery,
  useGetProfitsYearQuery,
  useLazyGetFinancialSummaryQuery,
  useLazyGetMetricsQuery,
  useLazyGetProfitsCustomQuery,
  useLazyGetProfitsQuarterQuery,
  useLazyGetProfitsTodayQuery,
  useLazyGetProfitsWeekQuery,
  useLazyGetProfitsYearQuery,
  useLazyGetPendingQuery,
  useLazyGetProfitsMonthQuery,
  useLazyGetProfitsPrevMonthQuery,
  useGetAllSalesQuery,
  useLazyGetAllSalesQuery,
  useGetSerialNumbersQuery,
  useLazyGetSerialNumbersQuery,
} = metricsApi;
