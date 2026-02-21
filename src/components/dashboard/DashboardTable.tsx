import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import React from "react";
import ActionButtons from "./ActionButtons";

interface DashboardTableProps {
  columns: ColumnsType;
  data: any[];
  isFetching: boolean;
  isError?: boolean;
  action: any;
  type: string;
  callBackAction?: any;
  hidePagination?: boolean;
}

function DashboardTable({
  columns,
  data,
  isFetching,
  action,
  type,
  callBackAction,
  hidePagination,
}: DashboardTableProps) {
  const actionColumn = {
    title: "Action",
    dataIndex: "action",
    key: "action",
    fixed: "right" as const,
    width: 80,
    render: (_: any, record: any) => (
      <ActionButtons
        type={type}
        id={
          type === "inventory"
            ? record.product_name
            : type !== "orders"
              ? record.id
              : record.saleId
        }
        action={action}
        callBackAction={callBackAction}
      />
    ),
  };

  const columnWithAction = type ? [...columns, actionColumn] : columns;

  return (
    <div className="w-full overflow-x-auto">
      <Table
        columns={columnWithAction}
        dataSource={data}
        loading={isFetching}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={
          hidePagination
            ? false
            : {
                pageSize: 20,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} of ${total}`,
                className: "px-4",
              }
        }
        rowClassName={() => "custom-table-row"}
        className="w-full"
        style={{ minWidth: 0 }}
      />
    </div>
  );
}

export default DashboardTable;
