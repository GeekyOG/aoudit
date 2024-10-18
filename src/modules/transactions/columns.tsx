import { ColumnsType } from "antd/es/table";
import { formatAmount } from "../../utils/format";
import React from "react";
// import React from "react";

export const columns: ColumnsType = [
  {
    title: "Full Name",
    dataIndex: "fullName",
    key: "amount",
  },
  {
    title: "Item Name",
    dataIndex: "amount",
    key: "companyName",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "",
    render: (value) => <p>{formatAmount(value)}</p>,
  },
  {
    title: "Paid",
    dataIndex: "amount",
    key: "",
    render: (value) => <p>{formatAmount(value)}</p>,
  },

  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },

  {
    title: "Date added",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "",
    dataIndex: "id",
    key: "id",
  },
];
