import { ColumnsType } from "antd/es/table";
import React from "react";
import { cn } from "../../utils/cn";
import { format } from "date-fns";

export const columns: ColumnsType = [
  {
    title: "Action",
    dataIndex: "description",
    key: "description",
    render: (_, record) => (
      <div>
        <p className="font-[500] text-[0.75rem] text-[#18181B]">
          {record.action}
        </p>
        <p>Description: {record.description}</p>
      </div>
    ),
  },
  {
    title: "Model",
    dataIndex: "model",
    key: "model",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">{record.model}</p>
    ),
  },
  {
    title: "Changed By",
    dataIndex: "changedBy",
    key: "changedBy",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] max-w-[150px] text-[#18181B]">
        {record.changedBy}
      </p>
    ),
  },

  {
    title: "Date added",
    dataIndex: "",
    key: "",
    render: (_, record) => {
      const formattedDate = format(new Date(record.timestamp), "dd, MMM, yyyy");
      return formattedDate;
    },
  },
];
