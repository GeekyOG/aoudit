import { ColumnsType } from "antd/es/table";
import React from "react";
import { formatAmount } from "../../utils/format";

export const columns: ColumnsType = [
  {
    title: "Item",
    dataIndex: "item",
    key: "item",
    render: (_, row) => (
      <p className="text-[0.75rem] text-[#18181B]">
        {row.Product.product_name}
      </p>
    ),
  },
  {
    title: "SN",
    dataIndex: "serial_number",
    key: "serial_number",
    render: (value) => <p className="text-[0.75rem] text-[#18181B]">{value}</p>,
  },
  {
    title: "Size",
    dataIndex: "size",
    key: "size",
    render: (value) => <p className="text-[0.75rem] text-[#18181B]">{value}</p>,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (value) => (
      <p className=" text-[0.75rem] text-[#18181B]">{formatAmount(value)}</p>
    ),
  },
];
