import { ColumnsType } from "antd/es/table";
import React from "react";
import { format } from "date-fns";

export const columns: ColumnsType = [
  {
    title: "Business Name",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {record.first_name}
      </p>
    ),
  },

  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },

  {
    title: "Phone Number",
    dataIndex: "phone_number",
    key: "phone_number",
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
