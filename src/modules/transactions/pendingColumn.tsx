import { ColumnsType } from "antd/es/table";
import { formatAmount } from "../../utils/format";
import React from "react";
// import React from "react";

export const columns: ColumnsType = [
  {
    title: "Customer",
    dataIndex: "fullName",
    key: "amount",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {record.Sale.Customer.first_name} {record.Sale.Customer.last_name}
      </p>
    ),
  },
  {
    title: "Item Name",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <p className="font-[500] text-[0.75rem] text-[#18181B]">
        {record.Product.product_name}
      </p>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "",
    render: (_, record) => <p>{formatAmount(record.amount)}</p>,
  },
  {
    title: "Amount Paid",
    dataIndex: "amount",
    key: "",
    render: (_, record) => <p>{formatAmount(record.amount_paid)}</p>,
  },

  {
    title: "Pending",
    dataIndex: "amount",
    key: "",
    render: (_, record) => (
      <p>{formatAmount(record.amount - record.amount_paid)}</p>
    ),
  },
];
