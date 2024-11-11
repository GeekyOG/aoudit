import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { ListFilter, Search } from "lucide-react";
import { useLazyGetAdminUserQuery } from "../api/adminUsers";
import { columns } from "../modules/expenses/columns";
import { DatePicker, Popover } from "antd";
import AddExpense from "../modules/expenses/AddExpense";
import { useLazyGetExpenseQuery } from "../api/expensesApi";
import moment from "moment";

function Expenses() {
  const [open, setOpen] = useState(false);

  const [getExpenses, { data: expenses, isLoading, isError, isSuccess }] =
    useLazyGetExpenseQuery();
  const [fetchedData, setFetchedData] = useState<any[]>([]);

  useEffect(() => {
    getExpenses("");
    if (isSuccess) {
      setFetchedData(expenses);
    }
  }, [getExpenses]);

  const showDrawer = () => {
    setOpen(!open);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return expenses?.filter((item) =>
      item?.spentOn?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const onChange = (date, dateString, type) => {
    if (type === "start") {
      setStartDate(date ? date.toDate() : null);
    } else {
      setEndDate(date ? date.toDate() : null);
    }
  };

  useEffect(() => {
    let filteredData = expenses;

    // Filter by date
    if (startDate && endDate) {
      filteredData = filteredData?.filter((item) => {
        const date = moment(item.date);

        return date.isBetween(startDate, endDate, undefined, "[]");
      });
    }

    setFetchedData(filteredData);
  }, [startDate, endDate, expenses]);

  return (
    <div>
      <div>
        <Container className="flex items-center justify-between">
          <div className="flex">
            <div className="border-[1px] px-[15px] py-[8px]">
              <p>All Expenses</p>
            </div>
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="flex cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by description..."
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

            <Button onClick={showDrawer} className="flex h-[36px] items-center">
              Add Expense
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
          type={"expenses"}
        />
        <AddExpense open={open} setShowDrawer={setOpen} />
      </Container>
    </div>
  );
}

export default Expenses;
