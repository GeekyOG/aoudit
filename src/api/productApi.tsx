import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const productsApi = createApi({
  baseQuery,
  reducerPath: "productsApi",
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({
        url: "/products",
      }),
    }),

    getStockReport: builder.query({
      query: () => ({
        url: "products/products/stock-report",
      }),
    }),

    addProduct: builder.mutation({
      query: (body) => ({
        url: "/products/add",
        method: "POST",
        body,
      }),
    }),

    getAllProductsByVendorId: builder.query({
      query: (id) => ({
        url: `products/${id}/products`,
      }),
    }),

    getProduct: builder.query({
      query: (id) => ({
        url: `/products/${id}`,
      }),
    }),

    updateProduct: builder.mutation({
      query: ({ body, id }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllProductsByVendorIdQuery,
  useLazyGetAllProductsByVendorIdQuery,
  useLazyGetProductsQuery,
  useGetProductsQuery,
  useAddProductMutation,
  useDeleteProductMutation,
  useGetProductQuery,
  useLazyGetProductQuery,
  useUpdateProductMutation,
  useGetStockReportQuery,
  useLazyGetStockReportQuery,
} = productsApi;
