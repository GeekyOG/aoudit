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
import PendingPayments from "../pages/PendingPayments";
import DevicePage from "../pages/DevicePage";
import ExpensesHistory from "../pages/ExpensesHistory";
import ClosingStock from "../pages/ClosingStock";
import OpeningStock from "../pages/OpenStock";
import Auodit from "../pages/Auodit";
const Customers = Loadable(lazy(() => import("../pages/Customers")));
const Dashboard = Loadable(lazy(() => import("../pages/Dashboard")));
const Inventory = Loadable(lazy(() => import("../pages/Inventory")));
const Invoices = Loadable(lazy(() => import("../pages/Invoices")));
const Login = Loadable(lazy(() => import("../pages/Login")));
const Register = Loadable(lazy(() => import("../pages/Register")));
const Transactions = Loadable(lazy(() => import("../pages/Transactions")));
const Vendors = Loadable(lazy(() => import("../pages/Vendors")));
const OrderList = Loadable(lazy(() => import("../pages/OrderList")));
const Users = Loadable(lazy(() => import("../pages/Users")));
const Expenses = Loadable(lazy(() => import("../pages/Expenses")));
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
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "/device",
    element: <DevicePage />,
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
        path: "/dashboard/transactions/pending",
        element: (
          <RequirePermission permission="view_reports">
            <PendingPayments />
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
        path: "/dashboard/opening-stock",
        element: <OpeningStock />,
      },
      {
        path: "/dashboard/closing-stock",
        element: <ClosingStock />,
      },
      {
        path: "/dashboard/orderlist",
        element: (
          <RequirePermission permission="read_product">
            <OrderList />
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
      {
        path: "/dashboard/expenses",
        element: <Expenses />,
      },
      {
        path: "/dashboard/expenses/history/:period",
        element: <ExpensesHistory />,
      },
      {
        path: "/dashboard/users",
        element: (
          <RequirePermission permission="create_user">
            <Users />
          </RequirePermission>
        ),
      },
      {
        path: "/dashboard/auditlog",
        element: <Auodit />,
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
