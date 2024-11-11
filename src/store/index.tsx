import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "../api/authApi";
import { categoriesApi } from "../api/categoriesApi";
import { productsApi } from "../api/productApi";
import { subCategoryApi } from "../api/subCategories";
import { vendorsApi } from "../api/vendorApi";
import { customerApi } from "../api/customerApi";
import { metricsApi } from "../api/metrics";
import { adminUsersAPi } from "../api/adminUsers";
import { rolesApi } from "../api/rolesApi";
import { ordersApi } from "../api/ordersApi";
import { serialCodesApi } from "../api/serialCodesAPi";
import { expensesApi } from "../api/expensesApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [subCategoryApi.reducerPath]: subCategoryApi.reducer,
    [vendorsApi.reducerPath]: vendorsApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [metricsApi.reducerPath]: metricsApi.reducer,
    [adminUsersAPi.reducerPath]: adminUsersAPi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [serialCodesApi.reducerPath]: serialCodesApi.reducer,
    [expensesApi.reducerPath]: expensesApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      categoriesApi.middleware,
      productsApi.middleware,
      subCategoryApi.middleware,
      vendorsApi.middleware,
      customerApi.middleware,
      metricsApi.middleware,
      adminUsersAPi.middleware,
      rolesApi.middleware,
      ordersApi.middleware,
      serialCodesApi.middleware,
      expensesApi.middleware
    ),
});

setupListeners(store.dispatch);
