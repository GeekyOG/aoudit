import { ColumnsType } from "antd/es/table";
import React from "react";

export const columns: ColumnsType = [
  {
    title: "Full Name",
    dataIndex: "id",
    key: "id",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {record.firstName} {record.lastName}
      </p>
    ),
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },

  {
    title: "Phone Number",
    dataIndex: "phone",
    key: "phone",
  },

  {
    title: "Date added",
    dataIndex: "createdAt",
    key: "createdAt",
  },
];
