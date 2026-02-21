import { ColumnsType } from "antd/es/table";
import React from "react";
import { cn } from "../../utils/cn";
import { format } from "date-fns";
import { formatAmount } from "../../utils/format";
import { Package } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  returned: {
    label: "Returned",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  borrowed: {
    label: "Borrowed",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const getStatusStyle = (status: string) =>
  STATUS_STYLES[status?.toLowerCase()] ?? {
    label: status,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };

export const columns: ColumnsType = [
  {
    title: "Item",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <Package size={13} className="text-indigo-500" />
        </div>
        <span className="text-[13px] font-medium text-gray-800">
          {record.Product.product_name}
        </span>
      </div>
    ),
  },
  {
    title: "Price",
    dataIndex: "amount",
    key: "amount",
    render: (_, record) => (
      <span className="text-[13px] font-semibold text-gray-800">
        {formatAmount(record.amount)}
      </span>
    ),
  },
  {
    title: "Paid",
    dataIndex: "amount_paid",
    key: "amount_paid",
    render: (_, record) => {
      const fullPaid = record.amount === record.amount_paid;
      return (
        <span
          className={cn(
            "text-[13px] font-semibold",
            fullPaid ? "text-emerald-600" : "text-amber-600",
          )}
        >
          {formatAmount(record.amount_paid)}
        </span>
      );
    },
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (_, record) => {
      const { label, className } = getStatusStyle(record.Sale.status);
      return (
        <span
          className={cn(
            "inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border",
            className,
          )}
        >
          {label}
        </span>
      );
    },
  },
  {
    title: "Date Added",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date) => {
      if (!date) return <span className="text-gray-400 text-[12px]">—</span>;
      const d = new Date(date);
      return (
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-700">
            {format(d, "dd MMM yyyy")}
          </span>
          <span className="text-[11px] text-gray-400">
            {format(d, "HH:mm")}
          </span>
        </div>
      );
    },
  },
];
