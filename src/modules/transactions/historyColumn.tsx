import { ColumnsType } from "antd/es/table";
import { formatAmount } from "../../utils/format";
import React from "react";
import { format } from "date-fns";

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
    title: "Purchase Amount",
    dataIndex: "amount",
    key: "",
    render: (_, record) => (
      <p>{formatAmount(record.Product.purchase_amount)}</p>
    ),
  },
  {
    title: "Sales Amount",
    dataIndex: "amount",
    key: "",
    render: (_, record) => <p>{formatAmount(record.amount)}</p>,
  },

  {
    title: "Profit",
    dataIndex: "amount",
    key: "",
    render: (_, record) => (
      <p>{formatAmount(record.amount - record.Product.purchase_amount)}</p>
    ),
  },
  {
    title: "Date added",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (_, record) => {
      const formattedDate = format(new Date(record.Sale.date), "dd, MMM, yyyy");
      return formattedDate;
    },
  },
];
