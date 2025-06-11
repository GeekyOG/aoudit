import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const ordersApi = createApi({
  baseQuery,
  reducerPath: "ordersApi",
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        search,
      }: {
        page?: number;
        limit?: number;
        status?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
      }) => {
        const params = new URLSearchParams();

        params.append("page", page.toString());
        params.append("limit", limit.toString());

        if (status) params.append("status", status);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (search) params.append("search", search);

        return {
          url: `/sales?${params.toString()}`,
        };
      },
    }),

    addOrder: builder.mutation({
      query: (body) => ({
        url: "/sales/add",
        method: "POST",
        body,
      }),
    }),

    getOrder: builder.query({
      query: (id) => ({
        url: `/sales/${id}`,
      }),
    }),

    updateOrder: builder.mutation({
      query: (body) => ({
        url: `/sales/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    searchBySerialNumber: builder.query({
      query: (serialNumber) => ({
        url: `/sales/${serialNumber}/product`,
      }),
    }),

    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/sales/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazySearchBySerialNumberQuery,
  useLazyGetOrdersQuery,
  useGetOrdersQuery,
  useAddOrderMutation,
  useDeleteOrderMutation,
  useGetOrderQuery,
  useLazyGetOrderQuery,
  useUpdateOrderMutation,
} = ordersApi;
