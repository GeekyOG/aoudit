import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddCustomer from "../modules/customers/AddCustomer";
import { columns } from "../modules/customers/columns";
import { Search, UserPlus, Users } from "lucide-react";
import { useLazyGetCustomersQuery } from "../api/customerApi";

function Customers() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [getCustomers, { data: customersData, isLoading }] =
    useLazyGetCustomersQuery();

  useEffect(() => {
    getCustomers("");
  }, [getCustomers]);

  const filteredOptions = useMemo(() => {
    return customersData?.filter((item) =>
      item?.first_name?.toLowerCase().includes(searchTerm?.toLowerCase()),
    );
  }, [customersData, searchTerm]);

  const displayData = filteredOptions || customersData || [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users size={17} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Customers</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {customersData?.length ?? 0} total customer
                {customersData?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-sm rounded-xl h-9 px-4 bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus size={15} />
            Add Customer
          </Button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            {/* Tab indicator */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
                All Customers
              </span>
              {!isLoading && (
                <span className="text-xs text-gray-400 font-medium">
                  {displayData.length} result
                  {displayData.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-48"
                placeholder="Search by name..."
              />
            </div>
          </div>

          {/* Table */}
          <DashboardTable
            columns={columns}
            data={displayData}
            isFetching={isLoading}
            action={undefined}
            type="customers"
            callBackAction={() => getCustomers("")}
          />
        </div>
      </div>

      <AddCustomer open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default Customers;
