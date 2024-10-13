import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React from "react";
import TableActionButtons from "../../ui/dashboard/TableActionButtons";
import CategoriesActionButtons from "../../modules/products/CategoriesActionButtons";
import ActionButtons from "./ActionButtons";

interface DashboardTableProps {
  columns: ColumnsType;
  data: any[];
  isFetching: boolean;
  isError?: boolean;
  action: any;
  type: string;
  callBackAction?: any;
}

function DashboardTable({
  columns,
  data,
  isFetching,
  isError,
  action,
  type,
  callBackAction,
}: DashboardTableProps) {
  const columnWithAction = [
    ...columns,

    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => {
        return (
          <ActionButtons
            type={type}
            id={
              type == "inventory"
                ? record.product_name
                : type !== "orders"
                  ? record.id
                  : record.saleId
            }
            action={action}
            callBackAction={callBackAction}
          />
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={type ? columnWithAction : columns}
        dataSource={data}
        className="w-[100%] border-[1px]"
        loading={isFetching}
        rowKey="id"
        rowClassName={() => "custom-table-row"}
      />
    </div>
  );
}

export default DashboardTable;
