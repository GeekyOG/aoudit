import { ColumnsType } from "antd/es/table";
import React from "react";
import { cn } from "../../utils/cn";
import { format } from "date-fns";
import { formatAmount } from "../../utils/format";

export const columns: ColumnsType = [
  {
    title: "Item",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {record.Product.product_name}
      </p>
    ),
  },
  {
    title: "Price",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {formatAmount(record.amount)}
      </p>
    ),
  },
  {
    title: "Paid",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {formatAmount(record.amount_paid)}
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
          record.amount == record.amount_paid && "bg-[#95efba94]",
          record.Sale.status == "returned" && "bg-red-50",
          record.Sale.status == "borrowed" && "bg-red-50",
          record.Sale.status == "pending" && "bg-red-50"
        )}
      >
        <p
          className={cn(
            `font-[500] text-[0.75rem] text-center`,
            record.amount !== record.amount_paid && "text-[#00C853]",
            record.Sale.status == "returned" && "text-red",
            record.Sale.status == "borrowed" && "text-red",
            record.Sale.status == "pending" && "text-red"
          )}
        >
          {/* {record.Sale.status == "completed" || record.Sale.status == "returned"
            ? record.Sale.status
            : record.amount !== record.amount_paid &&
                record.Sale.status != "returned"
              ? "Pending"
              : "Completed"} */}

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
