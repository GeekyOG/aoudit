import { ColumnsType } from "antd/es/table";
import React from "react";
import { format } from "date-fns";
import { Mail, Phone } from "lucide-react";

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const getInitials = (first: string, last: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

export const columns: ColumnsType = [
  {
    title: "Full Name",
    dataIndex: "name",
    key: "name",
    render: (_, record) => {
      const first = record.first_name ?? "";
      const last = record.last_name ?? "";
      return (
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${getAvatarColor(first)}`}
          >
            {getInitials(first, last)}
          </div>
          <span className="text-[13px] font-medium text-gray-800">
            {first} {last}
          </span>
        </div>
      );
    },
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (email) => (
      <div className="flex items-center gap-2 text-[12px] text-gray-600">
        <Mail size={13} className="text-gray-400 shrink-0" />
        <span>{email ?? "—"}</span>
      </div>
    ),
  },
  {
    title: "Phone Number",
    dataIndex: "phone_number",
    key: "phone_number",
    render: (phone) => (
      <div className="flex items-center gap-2 text-[12px] text-gray-600">
        <Phone size={13} className="text-gray-400 shrink-0" />
        <span>{phone ?? "—"}</span>
      </div>
    ),
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
