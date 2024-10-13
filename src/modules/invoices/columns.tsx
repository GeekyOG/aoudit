import { ColumnsType } from "antd/es/table";
import React from "react";
import { cn } from "../../utils/cn";
import { format } from "date-fns";

export const columns: ColumnsType = [
  {
    title: "First Name",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {record.Sale.Customer.first_name}
      </p>
    ),
  },
  {
    title: "Last Name",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {record.Sale.Customer.last_name}
      </p>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {record.Sale.Customer.email}
      </p>
    ),
  },

  {
    title: "Status",
    dataIndex: "status",
    key: "status",

    render: (_, record) => (
      <div
        className={cn(
          `p-[3px] rounded-[4px]`,
          record.Sale.status !== "completed" ? "bg-red-50" : "bg-[#95efba94]"
        )}
      >
        <p
          className={cn(
            `font-[500] text-[0.75rem] text-center`,
            record.Sale.status !== "completed"
              ? "text-red-500"
              : "text-[#00C853]"
          )}
        >
          {record.Sale.status}
        </p>
      </div>
    ),
  },

  {
    title: "Date added",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date) => {
      const formattedDate = format(new Date(date), "dd, MMM, yyyy");
      return formattedDate;
    },
  },
];
