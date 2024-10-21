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

    getProfitsYear: builder.query({
      query: () => ({
        url: "/profits?filter=year",
      }),
    }),

    getProfitsCustom: builder.query({
      query: () => ({
        url: "/profits?startDate=2024-01-01&endDate=2024-01-31",
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
} = metricsApi;
