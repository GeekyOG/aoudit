import {
  fetchBaseQuery,
  FetchBaseQueryError,
  BaseQueryFn,
  FetchArgs,
} from "@reduxjs/toolkit/query";
import Cookies from "js-cookie";
import { logout } from "../utils/logout";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8000/api",
  // baseUrl: "https://sammyapi.aoudit.com/api",
  prepareHeaders: (headers) => {
    // Retrieve the token from cookies
    const token = Cookies.get("authToken");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const BaseQueryInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const errorData = result.error.data as { message?: string };

    if (errorData.message !== "Your credential is invalid") {
      logout();
    }
  }

  return result;
};

export default BaseQueryInterceptor;
