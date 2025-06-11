import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from ".";

export const auditApi = createApi({
  baseQuery,
  reducerPath: "auditApi",
  endpoints: (builder) => ({
    getAudits: builder.query({
      query: () => ({
        url: "/audit-logs",
      }),
    }),

    getAudit: builder.query({
      query: (id) => ({
        url: `/audit-logs/${id}`,
      }),
    }),
  }),
});

export const {
  useLazyGetAuditsQuery,
  useGetAuditsQuery,
  useGetAuditQuery,
  useLazyGetAuditQuery,
} = auditApi;
