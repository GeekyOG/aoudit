import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Applayout from "../layout/Applayout";
import AuthLayout from "../layout/AuthLayout";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Loadable from "./Loadable";

import AddItem from "../pages/AddItem";
import UnAuthorizedPage from "../pages/UnAuthorizedPage";
import RequirePermission from "./RequirePermission";
import TransactionHistory from "../pages/TransactionHistory";
const Customers = Loadable(lazy(() => import("../pages/Customers")));
const Dashboard = Loadable(lazy(() => import("../pages/Dashboard")));
const Inventory = Loadable(lazy(() => import("../pages/Inventory")));
const Invoices = Loadable(lazy(() => import("../pages/Invoices")));
const Login = Loadable(lazy(() => import("../pages/Login")));
const Register = Loadable(lazy(() => import("../pages/Register")));
const Transactions = Loadable(lazy(() => import("../pages/Transactions")));
const Vendors = Loadable(lazy(() => import("../pages/Vendors")));
const WholeSale = Loadable(lazy(() => import("../pages/WholeSale")));
const Users = Loadable(lazy(() => import("../pages/Users")));
const VendorsProducts = Loadable(
  lazy(() => import("../pages/VendorsProducts"))
);
const CustomerOrders = Loadable(lazy(() => import("../pages/CustomerOrders")));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { index: true, element: <Register /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Applayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "/dashboard/transactions",
        element: (
          <RequirePermission permission="view_reports">
            <Transactions />
          </RequirePermission>
        ),
      },

      {
        path: "/dashboard/transactions/history/:period",
        element: (
          <RequirePermission permission="view_reports">
            <TransactionHistory />
          </RequirePermission>
        ),
      },
      {
        path: "/dashboard/customers",
        element: (
          <RequirePermission permission="read_customer">
            <Customers />
          </RequirePermission>
        ),
      },
      {
        path: "/dashboard/customers/:id/orders",
        element: (
          <RequirePermission permission="read_customer">
            <CustomerOrders />
          </RequirePermission>
        ),
      },
      {
        path: "/dashboard/invoices",
        element: (
          <RequirePermission permission="read_order">
            <Invoices />
          </RequirePermission>
        ),
      },
      {
        path: "/dashboard/inventory",
        element: (
          <RequirePermission permission="read_product">
            <Inventory />
          </RequirePermission>
        ),
      },
      {
        path: `/dashboard/product/:productName`,
        element: <AddItem />,
      },
      {
        path: "/dashboard/vendors",
        element: (
          <RequirePermission permission="read_vendor">
            <Vendors />
          </RequirePermission>
        ),
      },
      {
        path: "/dashboard/vendors/:id/products",
        element: (
          <RequirePermission permission="read_vendor">
            <VendorsProducts />
          </RequirePermission>
        ),
      },
      // {
      //   path: "/dashboard/wholesale",
      //   element: <WholeSale />,
      // },
      {
        path: "/dashboard/users",
        element: (
          <RequirePermission permission="create_user">
            <Users />
          </RequirePermission>
        ),
      },
      {
        path: "/dashboard/settings",
        element: <Vendors />,
      },
      { path: "/dashboard/unauthorized", element: <UnAuthorizedPage /> },
    ],
  },
  {
    path: "*",
    element: <h1>404 Not Found</h1>,
  },
]);

export default router;
