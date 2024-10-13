import { ColumnsType } from "antd/es/table";

import React from "react";
import CategoriesActionButtons from "./CategoriesActionButtons";
import { format } from "date-fns";

export const subCategoryColumns: ColumnsType = [
  {
    title: "Size",
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
