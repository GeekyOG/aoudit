import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const ordersApi = createApi({
  baseQuery,
  reducerPath: "ordersApi",
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: () => ({
        url: "/sales",
      }),
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
