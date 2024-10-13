import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const customerApi = createApi({
  baseQuery,
  reducerPath: "customerApi",
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: () => ({
        url: "/customers",
      }),
    }),

    addCustomer: builder.mutation({
      query: (body) => ({
        url: "/customers/add",
        method: "POST",
        body,
      }),
    }),

    getCustomer: builder.query({
      query: (id) => ({
        url: `/customers/${id}`,
      }),
    }),

    getAllCustomerOrders: builder.query({
      query: (id) => ({
        url: `/sales/${id}/customer`,
      }),
    }),

    updateCustomer: builder.mutation({
      query: (body) => ({
        url: `/customers/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetCustomersQuery,
  useGetCustomersQuery,
  useGetAllCustomerOrdersQuery,
  useLazyGetAllCustomerOrdersQuery,
  useAddCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerQuery,
  useLazyGetCustomerQuery,
  useUpdateCustomerMutation,
} = customerApi;
