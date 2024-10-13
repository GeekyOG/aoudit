import { ColumnsType } from "antd/es/table";
import React from "react";
import { format } from "date-fns";

export const columns: ColumnsType = [
  {
    title: "Full Name",
    dataIndex: "id",
    key: "id",
    render: (_, row) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {row.firstname} {row.lastname}
      </p>
    ),
  },
  {
    title: "Role",
    dataIndex: "id",
    key: "id",
    render: (_, row) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {row.Role.name}
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
