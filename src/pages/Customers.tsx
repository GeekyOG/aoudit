import React, { useEffect, useState } from "react";
import Container from "../ui/Container";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddCustomer from "../modules/customers/AddCustomer";
import { columns } from "../modules/customers/columns";
import { Search } from "lucide-react";
import { useLazyGetCustomersQuery } from "../api/customerApi";

function Customers() {
  const [open, setOpen] = useState(false);
  const [getCustomers, { data: customersData, isLoading, isError }] =
    useLazyGetCustomersQuery();

  const showDrawer = () => {
    setOpen(!open);
  };

  const handleGetCustomers = () => {
    getCustomers("");
  };

  useEffect(() => {
    handleGetCustomers();
  }, [getCustomers]);

  return (
    <div>
      <div>
        <Container className="flex items-center justify-between">
          <div className="flex gap-[5px]">
            <div className="rounded-tl-[4px] rounded-tr-[4px] border-[1px] border-b-0 px-[15px] py-[8px] ">
              <p className="font-[600] text-secondary-600">All Customers</p>
            </div>
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="flex cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by name..."
              />
            </div>
            <Button onClick={showDrawer} className="flex h-[36px] items-center">
              Add Customer
            </Button>
          </div>
        </Container>
      </div>
      <Container>
        <DashboardTable
          columns={columns}
          data={customersData || []}
          isFetching={isLoading}
          action={undefined}
          type={"customers"}
          callBackAction={() => handleGetCustomers()}
        />
      </Container>
      <AddCustomer open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default Customers;
