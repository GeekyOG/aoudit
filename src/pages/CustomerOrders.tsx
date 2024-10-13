import React, { useEffect, useState } from "react";
import Container from "../ui/Container";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddInvoices from "../modules/invoices/AddInvoices";
import { Popover, DatePicker, DatePickerProps } from "antd";
import { Search, ListFilter, Download } from "lucide-react";
import { useLazyGetOrdersQuery } from "../api/ordersApi";
import { columns } from "../modules/customers/customerOrdersColumn";
import { handleExportCSV } from "../utils/export";
import { cn } from "../utils/cn";
import moment from "moment";
import { useParams } from "react-router-dom";
import {
  useLazyGetAllCustomerOrdersQuery,
  useLazyGetCustomerQuery,
} from "../api/customerApi";
import DataLoading from "../ui/DataLoading";
function CustomersOrders() {
  const [open, setOpen] = useState(false);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [activeTab, setTab] = useState("All");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { id } = useParams<{ id: string }>();

  const [getOrder, { data: ordersData, isFetching, isError, isSuccess }] =
    useLazyGetAllCustomerOrdersQuery();

  const [getOrders] = useLazyGetOrdersQuery();
  // Fetch orders when the component mounts
  useEffect(() => {
    getOrder(id); // Fetch orders without filters initially
  }, [getOrders, getOrder]);

  // Update fetched data once orders are successfully retrieved
  useEffect(() => {
    if (isSuccess && ordersData) {
      setFetchedData(ordersData); // Set the fetched orders
    }
  }, [isSuccess, ordersData]);

  // Handle tab switching and filtering based on the status

  const Tabs = ["All", "Completed", "Pending", "Returned", "Borrowed"];

  const onChange = (date, dateString, type) => {
    if (type === "start") {
      setStartDate(date ? date.toDate() : null);
    } else {
      setEndDate(date ? date.toDate() : null);
    }
  };
  useEffect(() => {
    let filteredData = ordersData;

    // Filter by status
    if (activeTab !== "All") {
      // if (activeTab == "Pending") {
      //   filteredData = filteredData?.filter((item) => {
      //     if (item.Sale.status !== "returned") {
      //       return item.amount !== item.amount_paid;
      //     }
      //   });
      // } else {
      filteredData = filteredData?.filter((item) => {
        return item.Sale.status === activeTab.toLowerCase();
      });
      // }
    }

    // Filter by date
    if (startDate && endDate) {
      filteredData = filteredData.filter((item) => {
        const createdAt = moment(item.createdAt);
        return createdAt.isBetween(startDate, endDate, undefined, "[]");
      });
    }

    setFetchedData(filteredData);
  }, [activeTab, startDate, endDate, ordersData]);

  const [getCustomer, { data, isLoading: customerLoading }] =
    useLazyGetCustomerQuery();

  useEffect(() => {
    if (id) {
      getCustomer(id);
    }
  }, [id]);

  return (
    <div>
      {customerLoading && (
        <div className="flex items-center justify-center h-[80vh]">
          <DataLoading />
        </div>
      )}
      {data && !customerLoading && (
        <>
          <div className="">
            <Container>
              <h1 className="text-[1.45rem] font-[700] text-neutral-500">
                Customer Details
              </h1>

              <div className="flex flex-col gap-6 border-b-[1px] pb-[16px] mt-[24px] text-[0.865rem]">
                <div className="flex gap-[16px]">
                  <p className="text-neutral-400 font-[600] w-[120px]">
                    First Name:
                  </p>
                  <p>{data?.first_name}</p>
                </div>
                <div className="flex gap-[16px]">
                  <p className="text-neutral-400 font-[600] w-[120px]">
                    Last Name:
                  </p>
                  <p>{data?.last_name}</p>
                </div>
                <div className="flex gap-[16px]">
                  <p className="text-neutral-400 font-[600] w-[120px]">
                    Email Address:
                  </p>
                  <p>{data?.email}</p>
                </div>
                <div className="flex gap-[16px]">
                  <p className="text-neutral-400 font-[600] w-[120px]">
                    Phone Number:
                  </p>
                  <p>{data?.phone_number}</p>
                </div>
              </div>
            </Container>
            <Container className="py-[20px]">
              <h1 className="text-[1.35rem] font-[700] text-neutral-500">
                Purchase History
              </h1>
            </Container>
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
                    <p className="text-[0.865rem] ">{tab}</p>
                  </button>
                ))}
              </div>

              <div className="mb-[3px] flex items-center gap-[8px]">
                <div className="lg:flex hidden cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
                  <Search size={16} className="text-neutral-300" />
                  <input
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
                    handleExportCSV({
                      data: fetchedData,
                      fileName: "sales.csv",
                    })
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
              data={fetchedData || []}
              isFetching={isFetching}
              action={() => getOrders("")}
              type={"orders"}
            />
          </Container>

          <AddInvoices open={open} setShowDrawer={setOpen} />
        </>
      )}
    </div>
  );
}

export default CustomersOrders;
