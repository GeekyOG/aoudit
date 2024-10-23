import React, { useEffect, useMemo, useState } from "react";
import Container from "../ui/Container";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddVendor from "../modules/vendors/AddVendor";
import { columns } from "../modules/vendors/columns";
import { Search } from "lucide-react";
import {
  useLazyGetSupplierQuery,
  useLazyGetSuppliersQuery,
} from "../api/vendorApi";

function Vendors() {
  const [open, setOpen] = useState(false);

  const [getSuppliers, { data, isLoading }] = useLazyGetSuppliersQuery();

  useEffect(() => {
    getSuppliers("");
  }, [getSuppliers]);

  const handleGetVendors = () => {
    getSuppliers("");
  };

  const showDrawer = () => {
    setOpen(!open);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return data?.filter((item) =>
      item?.first_name?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }, [data, searchTerm]);

  return (
    <div>
      <div>
        <Container className="flex items-center justify-between">
          <div className="flex gap-[5px]">
            <div className="rounded-tl-[4px] rounded-tr-[4px] border-[1px] border-b-0 px-[15px] py-[8px] ">
              <p className="font-[600] text-secondary-600">All</p>
            </div>
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="flex cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by name..."
              />
            </div>
            <Button onClick={showDrawer} className="flex h-[36px] items-center">
              Add Vendor
            </Button>
          </div>
        </Container>
      </div>
      <Container>
        <DashboardTable
          columns={columns}
          data={filteredOptions || data || []}
          isFetching={isLoading}
          action={handleGetVendors}
          callBackAction={handleGetVendors}
          type={"vendors"}
        />
      </Container>
      <AddVendor open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default Vendors;
