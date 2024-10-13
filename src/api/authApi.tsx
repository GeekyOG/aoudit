import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const authApi = createApi({
  baseQuery,
  reducerPath: "api",
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (body) => ({
        body,
        url: "users/login",
        method: "POST",
      }),
    }),

    registerUser: builder.mutation({
      query: (body) => ({
        body,
        url: "/users/register",
        method: "POST",
      }),
    }),

    refreshToken: builder.mutation({
      query: (body) => ({
        body,
        url: "auth/refresh",
        method: "POST",
      }),
    }),

    enable2Fa: builder.mutation({
      query: (id: string) => ({
        url: `/users/${id}/activate-2fa`,
        method: "PATCH",
      }),
    }),

    verifyToken: builder.mutation({
      query: (body) => ({
        url: `/auth/login-2fa`,
        method: "POST",
        body,
      }),
    }),

    dashboardPasswordReset: builder.mutation({
      query: (body) => ({
        body,
        url: "/auth/password/reset-password",
        method: "PUT",
      }),
    }),
    profilePasswordReset: builder.mutation({
      query: (body) => ({
        body,
        url: "/auth/password/request-reset",
        method: "POST",
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: `auth/logout`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRefreshTokenMutation,
  useLogoutUserMutation,
  useDashboardPasswordResetMutation,
  useProfilePasswordResetMutation,
  useEnable2FaMutation,
  useVerifyTokenMutation,
  useRegisterUserMutation,
} = authApi;
