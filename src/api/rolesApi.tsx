import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const rolesApi = createApi({
  baseQuery,
  reducerPath: "rolesApi",
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => ({
        url: "/roles",
      }),
    }),

    addRole: builder.mutation({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
    }),

    getRole: builder.query({
      query: (id) => ({
        url: `/roles/${id}`,
      }),
    }),

    updateRole: builder.mutation({
      query: (body) => ({
        url: `/roles/${body.id}`,
        method: "PUT",
        body,
      }),
    }),

    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLazyGetRolesQuery,
  useGetRolesQuery,
  useAddRoleMutation,
  useDeleteRoleMutation,
  useGetRoleQuery,
  useLazyGetRoleQuery,
  useUpdateRoleMutation,
} = rolesApi;
