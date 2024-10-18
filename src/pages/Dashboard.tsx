import React, { useState } from "react";
import Container from "../ui/Container";
import DashboardBox from "../ui/dashboard/DashboardBox";
import DashboardTable from "../components/dashboard/DashboardTable";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetMetricsQuery } from "../api/metrics";
import { useGetOrdersQuery, useLazyGetOrdersQuery } from "../api/ordersApi";
import { columns } from "../modules/invoices/columns";
import AddCustomer from "../modules/customers/AddCustomer";
import InvoiceModal from "../modules/invoices/InvoiceModal";
import AddProductModal from "../modules/products/AddProductModal";
import SearchModal from "../components/dashboard/SearchModal";

function Dashboard() {
  const navigate = useNavigate();
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError,
  } = useGetOrdersQuery("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [open, setOpen] = useState(false);
  const [openAddCustomers, setOpenAddCustomers] = useState(false);
  const { data, isLoading } = useGetMetricsQuery("");
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
        />
        <DashboardBox
          title="Total Sales"
          value={data?.totalSales ?? 0}
          action={() => setOpen(!open)}
        />
      </div>

      <div className="flex flex-col gap-[24px] md:flex-row mt-[24px]">
        <DashboardBox
          title="Total Inventory"
          value={data?.totalProducts ?? 0}
          action={() => setShowAddProduct(!showAddProduct)}
        />
        <DashboardBox
          title="Total Items Returned"
          value={data?.returnedSalesCount ?? 0}
          action={() => setOpen(!open)}
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
          data={ordersData || []}
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
function useEffect(
  arg0: () => void,
  arg1: ((
    arg: any,
    preferCacheValue?: boolean
  ) => import("@reduxjs/toolkit/query").QueryActionCreatorResult<
    import("@reduxjs/toolkit/query").QueryDefinition<
      any,
      import("@reduxjs/toolkit/query").BaseQueryFn<
        string | import("@reduxjs/toolkit/query").FetchArgs,
        unknown,
        import("@reduxjs/toolkit/query").FetchBaseQueryError
      >,
      never,
      any,
      "ordersApi"
    >
  >)[]
) {
  throw new Error("Function not implemented.");
}
