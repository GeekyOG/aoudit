import React from "react";
import { formatSnakeCase } from "../../utils/format";

const CreateRecordDisplay = ({ activity }: { activity: any }) => {
  let parsedData: Record<string, any> = {};
  try {
    parsedData = JSON.parse(activity.data);
  } catch (error) {
    console.error("Error parsing data:", error);
  }

  // Fields to emphasize at the top
  const priorityKeys = [
    "id",
    "invoice_number",
    "invoiceNumber",
    "total_amount",
    "status",
  ];
  const entries = Object.entries(parsedData);

  const formatValue = (value: any): React.ReactNode => {
    if (Array.isArray(value)) {
      if (value.length === 0)
        return <span className="text-gray-400 italic text-xs">None</span>;
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded-md border border-indigo-100 bg-indigo-50 text-indigo-700 font-mono"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${value ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    }

    const str = String(value);

    // Detect ISO dates
    if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
      return (
        <span className="text-gray-700 text-sm">
          {new Date(str).toLocaleString()}
        </span>
      );
    }

    // Detect status
    if (
      ["completed", "pending", "returned", "cancelled"].includes(
        str.toLowerCase(),
      )
    ) {
      const statusStyles: Record<string, string> = {
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        returned: "bg-blue-50 text-blue-700 border-blue-200",
        cancelled: "bg-red-50 text-red-700 border-red-200",
      };
      return (
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusStyles[str.toLowerCase()] ?? ""}`}
        >
          {str}
        </span>
      );
    }

    // Large numbers — likely money
    if (!isNaN(Number(str)) && Number(str) > 10000) {
      return (
        <span className="text-gray-900 font-semibold text-sm">
          {Number(str).toLocaleString()}
        </span>
      );
    }

    return <span className="text-gray-700 text-sm">{str}</span>;
  };

  return (
    <div className="px-6 py-5">
      <p className="text-sm text-gray-500 mb-5 text-center">
        {activity.description}
      </p>

      <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {entries.map(([key, value], idx) => (
          <div
            key={key}
            className={`flex gap-3 px-4 py-3 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"} ${idx !== 0 ? "border-t border-gray-100" : ""}`}
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-[130px] shrink-0 pt-0.5">
              {formatSnakeCase(key)}
            </span>
            <div className="flex-1 min-w-0">{formatValue(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateRecordDisplay;
