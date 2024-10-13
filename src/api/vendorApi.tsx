import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const vendorsApi = createApi({
  baseQuery,
  reducerPath: "vendorsApi",
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: () => ({
        url: "/vendors",
      }),
    }),

    addSupplier: builder.mutation({
      query: (body) => ({
        url: "/vendors/add",
        method: "POST",
        body,
      }),
    }),

    getSupplier: builder.query({
      query: (id) => ({
        url: `/vendors/${id}`,
      }),
    }),

    updateSupplier: builder.mutation({
      query: (body) => ({
        url: `/vendors/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/vendors/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetSuppliersQuery,
  useGetSuppliersQuery,
  useAddSupplierMutation,
  useDeleteSupplierMutation,
  useGetSupplierQuery,
  useLazyGetSupplierQuery,
  useUpdateSupplierMutation,
} = vendorsApi;
