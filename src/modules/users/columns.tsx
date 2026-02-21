import { ColumnsType } from "antd/es/table";
import React from "react";
import { format } from "date-fns";
import { Mail, Phone, ShieldCheck } from "lucide-react";

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
];

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-rose-50 text-rose-700 border-rose-200",
  manager: "bg-purple-50 text-purple-700 border-purple-200",
  staff: "bg-indigo-50 text-indigo-700 border-indigo-200",
  superadmin: "bg-amber-50 text-amber-700 border-amber-200",
};

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const getInitials = (first: string, last: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

const getRoleStyle = (role: string) =>
  ROLE_STYLES[role?.toLowerCase()] ??
  "bg-gray-50 text-gray-600 border-gray-200";

export const columns: ColumnsType = [
  {
    title: "Full Name",
    dataIndex: "id",
    key: "id",
    render: (_, row) => {
      const first = row.firstname ?? "";
      const last = row.lastname ?? "";
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
    title: "Role",
    dataIndex: "id",
    key: "role",
    render: (_, row) => (
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getRoleStyle(row.Role?.name)}`}
      >
        <ShieldCheck size={11} />
        {row.Role?.name ?? "—"}
      </span>
    ),
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
