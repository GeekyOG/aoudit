import { ColumnsType } from "antd/es/table";
import TableActionButtons from "../../ui/dashboard/TableActionButtons";
import React from "react";
import { format } from "date-fns";

export const columns: ColumnsType = [
  {
    title: "Product Name",
    dataIndex: "product_name",
    key: "product_name",
  },
  {
    title: "Size",
    dataIndex: "size",
    key: "size",
    render: (_, row) => {
      return <p>{row.size}</p>;
    },
  },

  {
    title: "Purchased Amount",
    dataIndex: "purchase_amount",
    key: "purchase_amount",
    render: (price) => <p>N{price}</p>,
  },
  {
    title: "Sales Amount",
    dataIndex: "sales_price",
    key: "sales_price",
    render: (price) => <p>N{price}</p>,
  },
  {
    title: "Qty",
    dataIndex: "serial_numbers",
    key: "serial_numbers",
    render: (_, row) => <p>{JSON.parse(row.serial_numbers).length}</p>,
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
