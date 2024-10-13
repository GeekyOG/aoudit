import React, { useState } from "react";
import Container from "../ui/Container";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddInvoices from "../modules/invoices/AddInvoices";
import { columns } from "../modules/transactions/columns";
import { Popover, DatePicker, DatePickerProps } from "antd";
import { Search, ListFilter, Download } from "lucide-react";

function WholeSale() {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(!open);
  };

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {};
  return (
    <div>
      <div className="">
        <Container className="flex items-center justify-between">
          <div className="flex gap-[5px]">
            <div className="rounded-tl-[4px] rounded-tr-[4px] border-[1px] border-b-0 px-[15px] py-[8px] ">
              <p className="font-[600] text-secondary-600">All</p>
            </div>
            <div className="rounded-tl-[4px] rounded-tr-[4px] border-[1px] border-b-0 px-[15px] py-[8px]">
              <p className="text-[0.865rem] text-neutral-300">Pending</p>
            </div>
            <div className="rounded-tl-[4px] rounded-tr-[4px] border-[1px] border-b-0 px-[15px] py-[8px]">
              <p className="text-[0.865rem] text-neutral-300">Completed</p>
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

            <Popover
              content={
                <div className="flex flex-col gap-3 px-[4px] py-[16px]">
                  <DatePicker onChange={onChange} placeholder="Start Date" />
                  <DatePicker onChange={onChange} placeholder="End Date" />

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

            <Button className="flex items-center gap-3 bg-[#a40909] text-[0.865rem]  h-[36px] ">
              <p>Export</p>
              <Download size={16} />
            </Button>
            <Button onClick={showDrawer} className="flex h-[36px] items-center">
              Add Sale
            </Button>
          </div>
        </Container>
      </div>
      <Container>
        <DashboardTable
          columns={columns}
          data={[]}
          isFetching={false}
          action={undefined}
          type={""}
        />
      </Container>
      <AddInvoices open={open} setShowDrawer={setOpen} />
    </div>
  );
}

export default WholeSale;
