import React, { useEffect, useMemo, useState } from "react";
import Container from "../ui/Container";
import { cn } from "../utils/cn";
import { ListFilter, Search } from "lucide-react";
import { DatePicker, Popover } from "antd";
import Button from "../ui/Button";
import DashboardTable from "../components/dashboard/DashboardTable";
import { columns } from "../modules/audit/columns";
import { useGetAuditsQuery } from "../api/audit";
import moment from "moment";
const Tabs = ["Audit"];

function Auodit() {
  const [activeTab, setTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedData, setFetchedData] = useState<any[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { data: ordersData, isLoading } = useGetAuditsQuery("");

  const onChange = (date, dateString, type) => {
    if (type === "start") {
      setStartDate(date ? date.toDate() : null);
    } else {
      setEndDate(date ? date.toDate() : null);
    }
  };

  useEffect(() => {
    const sortedResult: any = Object.values(ordersData ?? []).sort(
      (a: any, b: any) => {
        return moment(b.timestamp).isBefore(a.timestamp) ? -1 : 1;
      }
    );
    let filteredData = sortedResult;

    // Filter by status
    if (activeTab !== "All") {
      filteredData = filteredData?.filter((item) => {
        return item.model === activeTab.toLowerCase();
      });
    }

    // Filter by date
    if (startDate && endDate) {
      filteredData = filteredData?.filter((item) => {
        const date = moment(item.timestamp);

        return date.isBetween(startDate, endDate, undefined, "[]");
      });
    }

    setFetchedData(filteredData);
  }, [activeTab, startDate, endDate, ordersData]);

  const filteredOptions = useMemo(() => {
    return fetchedData?.filter((item) => {
      const customerNameMatch = item?.changedBy
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase());
      const productNameMatch = item?.description
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase());

      // const imeiMatch = item?.serial_number
      //   ?.toLowerCase()
      //   .includes(searchTerm?.toLowerCase());
      return customerNameMatch || productNameMatch;
    });
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
                <p className="text-[0.865rem] ">{tab}</p>
              </button>
            ))}
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="lg:flex hidden cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Enter name, product name or imie"
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
          </div>
        </Container>
      </div>
      <Container>
        <DashboardTable
          columns={columns}
          data={filteredOptions || fetchedData || []}
          isFetching={isLoading}
          action={() => {}}
          type={"audit"}
        />
      </Container>
    </div>
  );
}

export default Auodit;
