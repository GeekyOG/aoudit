import { ColumnsType } from "antd/es/table";
import React from "react";
import { format } from "date-fns";

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

const MODEL_STYLES: Record<string, string> = {
  Product: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Sale: "bg-purple-50 text-purple-700 border-purple-200",
};

export const columns: ColumnsType = [
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (_, record) => (
      <div className="flex flex-col gap-1">
        <span
          className={`self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            ACTION_STYLES[record.action] ??
            "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {record.action}
        </span>
        <p className="text-[12px] text-gray-500 leading-snug max-w-[240px]">
          {record.description}
        </p>
      </div>
    ),
  },
  {
    title: "Model",
    dataIndex: "model",
    key: "model",
    render: (_, record) => (
      <span
        className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${
          MODEL_STYLES[record.model] ??
          "bg-gray-50 text-gray-600 border-gray-200"
        }`}
      >
        {record.model}
      </span>
    ),
  },
  {
    title: "Changed By",
    dataIndex: "changedBy",
    key: "changedBy",
    render: (_, record) => (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-indigo-600 uppercase">
            {record.changedBy
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
        </div>
        <span className="text-[12px] font-medium text-gray-700 whitespace-nowrap">
          {record.changedBy}
        </span>
      </div>
    ),
  },
  {
    title: "Date",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (_, record) => {
      const date = new Date(record.timestamp);
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
