import React, { useState, useEffect } from "react";
import Container from "../ui/Container";
import DashboardBox from "../ui/dashboard/DashboardBox";
import DashboardTable from "../components/dashboard/DashboardTable";
import {
  ArrowRight,
  BarChart3,
  Package,
  RefreshCcw,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetMetricsQuery } from "../api/metrics";
import { useGetOrdersQuery } from "../api/ordersApi";
import { columns } from "../modules/invoices/columns";
import AddCustomer from "../modules/customers/AddCustomer";
import InvoiceModal from "../modules/invoices/InvoiceModal";
import AddProductModal from "../modules/products/AddProductModal";
import SearchModal from "../components/dashboard/SearchModal";
import { useLazyGetProductsQuery } from "../api/productApi";

function Dashboard() {
  const navigate = useNavigate();

  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery({
    page: 1,
    limit: 10,
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAddCustomers, setOpenAddCustomers] = useState(false);
  const { data } = useGetMetricsQuery("");
  const [getProducts, { data: productsData }] = useLazyGetProductsQuery();
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    getProducts({});
    if (productsData) {
      const totalSerialNumbersLength = productsData?.reduce(
        (total, product) => {
          const serialNumbersArray = JSON.parse(product.serial_numbers);
          return total + serialNumbersArray.length;
        },
        0,
      );
      setTotalItems(totalSerialNumbersLength);
    }
  }, [getProducts, productsData]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">{today}</p>
          </div>
        </div>

        <SearchModal />

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardBox
            title="All Customers"
            value={data?.totalCustomers ?? 0}
            action={() => setOpenAddCustomers(true)}
            link="/dashboard/customers"
            icon={<Users size={18} />}
            color="indigo"
          />
          <DashboardBox
            title="Total Sales"
            value={data?.totalSales ?? 0}
            action={() => setOpen(true)}
            link="/dashboard/invoices"
            icon={<BarChart3 size={18} />}
            color="emerald"
          />
          <DashboardBox
            title="Total Inventory"
            value={totalItems}
            action={() => setShowAddProduct(true)}
            link="/dashboard/inventory"
            icon={<Package size={18} />}
            color="amber"
          />
          <DashboardBox
            title="Items Returned"
            value={data?.returnedSalesCount ?? 0}
            action={() => setOpen(true)}
            link="/dashboard/invoices"
            icon={<RefreshCcw size={18} />}
            color="rose"
          />
        </div>

        {/* Recent Sales table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Recent Sales
            </h2>
            <button
              onClick={() => navigate("/dashboard/invoices")}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <DashboardTable
            columns={columns}
            data={ordersData?.data || []}
            isFetching={ordersLoading}
            action={undefined}
            type="orders"
          />
        </div>
      </div>

      <AddCustomer
        open={openAddCustomers}
        setShowDrawer={setOpenAddCustomers}
      />
      {open && <InvoiceModal setDialogOpen={setOpen} />}
      {showAddProduct && (
        <AddProductModal setShowAddProduct={setShowAddProduct} />
      )}
    </div>
  );
}

export default Dashboard;
