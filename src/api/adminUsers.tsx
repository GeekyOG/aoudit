import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const adminUsersAPi = createApi({
  baseQuery,
  reducerPath: "adminUsersAPi",
  endpoints: (builder) => ({
    getAminUsers: builder.query({
      query: () => ({
        url: "/admin/users",
      }),
    }),

    addAdminUser: builder.mutation({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
    }),

    getAdminUser: builder.query({
      query: (id) => ({
        url: `/admin/users/${id}`,
      }),
    }),

    updateAdminUser: builder.mutation({
      query: (body) => ({
        url: `/admin/users/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteAdminUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetAminUsersQuery,
  useGetAminUsersQuery,
  useAddAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminUserQuery,
  useLazyGetAdminUserQuery,
  useUpdateAdminUserMutation,
} = adminUsersAPi;
