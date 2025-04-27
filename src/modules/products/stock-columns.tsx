import { ColumnsType } from "antd/es/table";
import TableActionButtons from "../../ui/dashboard/TableActionButtons";
import React from "react";
import { format } from "date-fns";

export const columns: ColumnsType = [
  {
    title: "Product Name",
    dataIndex: "product_name",
    key: "product_name",
    render: (_, row) => {
      return (
        <div>
          <p>{row.product_name}</p>
        </div>
      );
    },
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
    title: "Qty",
    dataIndex: "serial_numbers",
    key: "serial_numbers",
    render: (_, row) => <p>{row.total_serial_numbers}</p>,
  },
];
