import { ColumnsType } from "antd/es/table";
import TableActionButtons from "../../ui/dashboard/TableActionButtons";
import React from "react";
import CategoriesActionButtons from "./CategoriesActionButtons";
import { format } from "date-fns";

export const categoryColumns: ColumnsType = [
  {
    title: "Color",
    dataIndex: "name",
    key: "name",
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
