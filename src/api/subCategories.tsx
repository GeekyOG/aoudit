import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const subCategoryApi = createApi({
  baseQuery,
  reducerPath: "subCategoryApi",
  endpoints: (builder) => ({
    getSubCategories: builder.query({
      query: () => ({
        url: "/subcategories",
      }),
    }),

    addSubCategory: builder.mutation({
      query: (body) => ({
        url: "/subcategories/add",
        method: "POST",
        body,
      }),
    }),

    getSubCategory: builder.query({
      query: (id) => ({
        url: `/subcategories/${id}`,
      }),
    }),

    updateSubCategory: builder.mutation({
      query: ({ body, id }) => ({
        url: `/subcategories/${id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteSubCategory: builder.mutation({
      query: (id) => ({
        url: `/subcategories/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetSubCategoriesQuery,
  useGetSubCategoriesQuery,
  useAddSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetSubCategoryQuery,
  useLazyGetSubCategoryQuery,
  useUpdateSubCategoryMutation,
} = subCategoryApi;
