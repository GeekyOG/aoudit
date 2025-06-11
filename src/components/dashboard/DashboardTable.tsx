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
        className="w-[100%] border-[1px] no-scrollbar"
        loading={isFetching}
        rowKey="id"
        pagination={hidePagination ? false : { pageSize: 20 }}
        rowClassName={() => "custom-table-row"}
      />
    </div>
  );
}

export default DashboardTable;
