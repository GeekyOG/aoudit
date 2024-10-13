import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const serialCodesApi = createApi({
  baseQuery,
  reducerPath: "serialCodesApi",
  endpoints: (builder) => ({
    getSerialCodes: builder.query({
      query: (productName: string) => ({
        url: `products/serial-numbers/${productName}`,
      }),
    }),

    addSerialCode: builder.mutation({
      query: (body) => ({
        url: "/serialcodes",
        method: "POST",
        body,
      }),
    }),

    getSerialCode: builder.query({
      query: (id) => ({
        url: `/serialcodes/${id}`,
      }),
    }),

    updateSerialCode: builder.mutation({
      query: (body) => ({
        url: `/serialcodes/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteSerialCode: builder.mutation({
      query: (id) => ({
        url: `/serialcodes/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetSerialCodesQuery,
  useGetSerialCodesQuery,
  useAddSerialCodeMutation,
  useDeleteSerialCodeMutation,
  useGetSerialCodeQuery,
  useLazyGetSerialCodeQuery,
  useUpdateSerialCodeMutation,
} = serialCodesApi;
