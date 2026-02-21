import React from "react";
import { IoIosAdd } from "react-icons/io";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { ArrowRight } from "lucide-react";

interface DashboardBoxProps {
  title: string;
  value: number | string;
  action?: () => void;
  className?: string;
  link?: string;
  icon?: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple";
}

const colorMap = {
  indigo: {
    icon: "bg-indigo-50 text-indigo-600",
    accent: "bg-indigo-600",
    link: "text-indigo-600 hover:text-indigo-700",
    add: "bg-indigo-50 hover:bg-indigo-100 text-indigo-600",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    accent: "bg-emerald-600",
    link: "text-emerald-600 hover:text-emerald-700",
    add: "bg-emerald-50 hover:bg-emerald-100 text-emerald-600",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    accent: "bg-amber-500",
    link: "text-amber-600 hover:text-amber-700",
    add: "bg-amber-50 hover:bg-amber-100 text-amber-600",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600",
    accent: "bg-rose-500",
    link: "text-rose-600 hover:text-rose-700",
    add: "bg-rose-50 hover:bg-rose-100 text-rose-600",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    accent: "bg-purple-600",
    link: "text-purple-600 hover:text-purple-700",
    add: "bg-purple-50 hover:bg-purple-100 text-purple-600",
  },
};

function DashboardBox({
  title,
  value,
  action,
  className,
  link,
  icon,
  color = "indigo",
}: DashboardBoxProps) {
  const styles = colorMap[color];

  return (
    <div
      className={cn(
        "bg-white w-full rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 relative overflow-hidden",
        className,
      )}
    >
      {/* Subtle top accent line */}
      <div
        className={cn("absolute top-0 left-0 right-0 h-0.5", styles.accent)}
      />

      <div className="flex items-start justify-between">
        {icon && (
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
              styles.icon,
            )}
          >
            {icon}
          </div>
        )}
        {action && (
          <button
            onClick={action}
            className={cn(
              "ml-auto h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
              styles.add,
            )}
            title={`Add ${title}`}
          >
            <IoIosAdd className="text-xl" />
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>

      {link && (
        <Link
          to={link}
          className={cn(
            "flex items-center gap-1 text-xs font-medium mt-auto transition-colors",
            styles.link,
          )}
        >
          View All <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

export default DashboardBox;
