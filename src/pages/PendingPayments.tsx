import React, { useEffect, useMemo, useState } from "react";
import Container from "../ui/Container";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddInvoices from "../modules/invoices/AddInvoices";
import { Popover, DatePicker, DatePickerProps } from "antd";
import { Search, ListFilter, Download } from "lucide-react";
import { handleExportCSV } from "../utils/export";
import { cn } from "../utils/cn";
import moment from "moment";
import { useLazyGetPendingQuery } from "../api/metrics";
import { columns } from "../modules/transactions/pendingColumn";
function TransactionHistory() {
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [activeTab, setTab] = useState("All");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [getPending, { data: pendingData, isLoading, isSuccess }] =
    useLazyGetPendingQuery();

  // Fetch orders when the component mounts
  useEffect(() => {
    getPending(""); // Fetch orders without filters initially
  }, [getPending]);

  // Update fetched data once orders are successfully retrieved
  useEffect(() => {
    if (isSuccess && pendingData) {
      setFetchedData(pendingData);
    }
  }, [isSuccess, pendingData]);

  const Tabs = [`All Pending Transactions`];

  const onChange = (date, dateString, type) => {
    if (type === "start") {
      setStartDate(date ? date.toDate() : null);
    } else {
      setEndDate(date ? date.toDate() : null);
    }
  };

  useEffect(() => {
    let filteredData = pendingData?.sales;

    // Filter by date
    if (startDate && endDate) {
      filteredData = filteredData?.filter((item) => {
        const createdAt = moment(item.createdAt);
        return createdAt.isBetween(startDate, endDate, undefined, "[]");
      });
    }

    setFetchedData(filteredData);
  }, [activeTab, startDate, endDate, pendingData]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return pendingData?.sales?.filter((item) =>
      item?.Sale.Customer.first_name
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase())
    );
  }, [fetchedData, searchTerm]);

  return (
    <div>
      <div className="">
        <Container className="flex items-center justify-between">
          <div className="flex gap-[5px]">
            {Tabs.map((tab, i) => (
              <button
                onClick={() => setTab(tab)}
                key={i}
                className={cn(
                  `rounded-tl-[4px] rounded-tr-[4px] border-[1px] border-b-0 px-[8px] py-[8px] `,
                  activeTab === tab
                    ? "font-[600] text-secondary-600"
                    : "text-neutral-300"
                )}
              >
                <p className="text-[0.865rem] capitalize">{tab}</p>
              </button>
            ))}
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="lg:flex hidden cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by name..."
              />
            </div>

            <Popover
              content={
                <div className="flex flex-col gap-3 px-[4px] py-[16px]">
                  <DatePicker
                    onChange={(date, dateString) =>
                      onChange(date, dateString, "start")
                    }
                    placeholder="Start Date"
                  />
                  <DatePicker
                    onChange={(date, dateString) =>
                      onChange(date, dateString, "end")
                    }
                    placeholder="End Date"
                  />

                  <Button className="items-center gap-3 bg-[#093aa4] text-[0.865rem]">
                    Apply
                  </Button>
                </div>
              }
              title=""
              placement="bottomLeft"
              showArrow={false}
            >
              <div className="flex cursor-pointer items-center gap-[3px] rounded-md px-[8px] py-[8px] text-neutral-300 hover:text-[#093aa4]">
                <ListFilter size={16} className="" />
                <p className="text-[0.865rem]">Filter</p>
              </div>
            </Popover>

            <Button
              className="flex items-center gap-3 bg-[#a40909] text-[0.865rem]  h-[36px]"
              onClick={() =>
                handleExportCSV({ data: fetchedData, fileName: "sales.csv" })
              }
            >
              <p>Export</p>
              <Download size={16} />
            </Button>
          </div>
        </Container>
      </div>
      <Container>
        <DashboardTable
          columns={columns}
          data={filteredOptions || fetchedData || []}
          isFetching={isLoading}
          action={() => {}}
          type={""}
        />
      </Container>

      <AddInvoices open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default TransactionHistory;
