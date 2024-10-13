import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const categoriesApi = createApi({
  baseQuery,
  reducerPath: "categoriesApi",
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => ({
        url: "/categories",
      }),
    }),

    addCategory: builder.mutation({
      query: (body) => ({
        url: "/categories/add",
        method: "POST",
        body,
      }),
    }),

    getCategory: builder.query({
      query: (id) => ({
        url: `/categories/${id}`,
      }),
    }),

    updateCategory: builder.mutation({
      query: (body) => ({
        url: `/categories/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetCategoriesQuery,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryQuery,
  useLazyGetCategoryQuery,
  useUpdateCategoryMutation,
} = categoriesApi;
