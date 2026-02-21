import { ColumnsType } from "antd/es/table";
import React from "react";
import { cn } from "../../utils/cn";
import { format } from "date-fns";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Completed",
  },
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  returned: { bg: "bg-blue-50", text: "text-blue-700", label: "Returned" },
  borrowed: { bg: "bg-purple-50", text: "text-purple-700", label: "Borrowed" },
};

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

export const columns: ColumnsType = [
  {
    title: "Customer",
    dataIndex: "name",
    key: "customer",
    render: (_, record) => {
      const first = record.Sale.Customer.first_name ?? "";
      const last = record.Sale.Customer.last_name ?? "";
      const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
      return (
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
              getAvatarColor(first),
            )}
          >
            {initials}
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-800 leading-tight">
              {first} {last}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    title: "Sold By",
    dataIndex: "soldBy",
    key: "soldBy",
    render: (_, record) => {
      const name = record.Sale.soldBy ?? "—";
      return (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
              getAvatarColor(name),
            )}
          >
            {name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <span className="text-[12px] text-gray-600">{name}</span>
        </div>
      );
    },
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (_, record) => {
      const status = record.Sale.status?.toLowerCase();
      const style = STATUS_STYLES[status] ?? {
        bg: "bg-gray-50",
        text: "text-gray-500",
        label: status,
      };
      return (
        <span
          className={cn(
            "inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full",
            style.bg,
            style.text,
          )}
        >
          {style.label}
        </span>
      );
    },
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (_, record) => {
      const date = new Date(record.Sale.date);
      return (
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-gray-700">
            {format(date, "dd MMM yyyy")}
          </span>
          <span className="text-[11px] text-gray-400">
            {format(date, "HH:mm")}
          </span>
        </div>
      );
    },
  },
];
