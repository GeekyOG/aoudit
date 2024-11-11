import { ColumnsType } from "antd/es/table";
import React from "react";
import { format } from "date-fns";

export const columns: ColumnsType = [
  {
    title: "Description",
    dataIndex: "id",
    key: "id",
    render: (_, row) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">{row.spentOn}</p>
    ),
  },
  {
    title: "Amount",
    dataIndex: "id",
    key: "id",
    render: (_, row) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">{row.amount}</p>
    ),
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (date) => {
      const formattedDate = format(new Date(date), "dd, MMM, yyyy");
      return formattedDate;
    },
  },

  {
    title: "Added By",
    dataIndex: "addedBy",
    key: "addedBy",
  },
];
