import React, { useState, useEffect } from "react";
import Container from "../ui/Container";
import DashboardBox from "../ui/dashboard/DashboardBox";
import DashboardTable from "../components/dashboard/DashboardTable";
import { ArrowRight } from "lucide-react";
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

  const [getProducts, { isFetching: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    getProducts({});

    if (productsData) {
      const totalSerialNumbersLength = productsData?.reduce(
        (total, product) => {
          const serialNumbersArray = JSON.parse(product.serial_numbers);
          return total + serialNumbersArray.length;
        },
        0
      );

      setTotalItems(totalSerialNumbersLength);
    }
  }, [getProducts, productsData]);

  return (
    <Container>
      <h1 className="text-[1.45rem] font-[600] text-neutral-500 mb-[24px]">
        Dashboard Overview
      </h1>
      <SearchModal />
      <div className="flex flex-col gap-[24px] md:flex-row">
        <DashboardBox
          title="All Customers"
          value={data?.totalCustomers ?? 0}
          action={() => setOpenAddCustomers(!openAddCustomers)}
          link="/dashboard/customers"
        />
        <DashboardBox
          title="Total Sales"
          value={data?.totalSales ?? 0}
          action={() => setOpen(!open)}
          link="/dashboard/invoices"
        />
      </div>

      <div className="flex flex-col gap-[24px] md:flex-row mt-[24px]">
        <DashboardBox
          title="Total Inventory"
          value={totalItems}
          action={() => setShowAddProduct(!showAddProduct)}
          link="/dashboard/inventory"
        />
        <DashboardBox
          title="Total Items Returned"
          value={data?.returnedSalesCount ?? 0}
          action={() => setOpen(!open)}
          link="/dashboard/invoices"
        />
      </div>
      <div className="mt-[26px]">
        <div className="flex items-center justify-between text-[0.895rem] font-[500]">
          <p className="text-[1.2rem] font-[500]">Recent Sales</p>

          <div
            className="flex cursor-pointer items-center"
            onClick={() => navigate("/dashboard/invoices")}
          >
            <p className="font-[300] text-[0.865rem] text-[#0505ab]">
              View all
            </p>
            <ArrowRight size={16} className="text-[#0505ab]" />
          </div>
        </div>

        <DashboardTable
          columns={columns}
          data={ordersData?.data || []}
          isFetching={ordersLoading}
          action={undefined}
          type={"orders"}
        />
      </div>
      <AddCustomer
        open={openAddCustomers}
        setShowDrawer={setOpenAddCustomers}
      />
      {open && <InvoiceModal setDialogOpen={setOpen} />}

      {showAddProduct && (
        <AddProductModal setShowAddProduct={setShowAddProduct} />
      )}
    </Container>
  );
}

export default Dashboard;
