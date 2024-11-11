import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const expensesApi = createApi({
  baseQuery,
  reducerPath: "expensesApi",
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: () => ({
        url: "/expenses",
      }),
    }),

    addExpense: builder.mutation({
      query: (body) => ({
        url: "/expenses",
        method: "POST",
        body,
      }),
    }),

    getExpense: builder.query({
      query: (id) => ({
        url: `/expenses/${id}`,
      }),
    }),

    updateExpense: builder.mutation({
      query: (body) => ({
        url: `/expenses/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
    }),

    getExpenseToday: builder.query({
      query: () => ({
        url: "/calculate-expenses?filter=day",
      }),
    }),

    getExpenseWeek: builder.query({
      query: () => ({
        url: "/calculate-expenses?filter=week",
      }),
    }),

    getExpenseQuarter: builder.query({
      query: () => ({
        url: "/calculate-expenses?filter=quarter",
      }),
    }),

    getExpenseMonth: builder.query({
      query: () => ({
        url: "/calculate-expenses?filter=month",
      }),
    }),

    getExpensePrevMonth: builder.query({
      query: () => ({
        url: "/calculate-expenses?filter=previousMonth",
      }),
    }),

    getExpenseYear: builder.query({
      query: () => ({
        url: "/expenses/calculated?filter=year",
      }),
    }),

    getExpenseCustom: builder.query({
      query: () => ({
        url: "/expenses/calculated?startDate=2024-01-01&endDate=2024-01-31",
      }),
    }),
  }),
});

export const {
  useLazyGetExpensesQuery,
  useGetExpensesQuery,
  useAddExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseQuery,
  useLazyGetExpenseQuery,
  useUpdateExpenseMutation,
  useGetExpenseCustomQuery,
  useGetExpenseTodayQuery,
  useGetExpenseWeekQuery,
  useGetExpenseQuarterQuery,
  useGetExpenseMonthQuery,
  useGetExpensePrevMonthQuery,
  useLazyGetExpenseCustomQuery,
  useLazyGetExpenseMonthQuery,
  useLazyGetExpensePrevMonthQuery,
  useLazyGetExpenseQuarterQuery,
  useLazyGetExpenseWeekQuery,
  useLazyGetExpenseTodayQuery,
  useLazyGetExpenseYearQuery,
} = expensesApi;
