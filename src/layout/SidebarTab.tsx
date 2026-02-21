import type { FunctionComponent, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import React from "react";
import { cn } from "../utils/cn";

interface SidebarTabProps {
  item: string;
  activeOption: string;
  url: string;
  icon?: ReactNode;
}

const SidebarTab: FunctionComponent<SidebarTabProps> = ({
  item,
  activeOption,
  url,
  icon,
}) => {
  const isActive = activeOption === url;

  return (
    <Link to={url}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
          isActive
            ? "bg-indigo-600 text-white"
            : "text-white/50 hover:text-white hover:bg-white/[0.06]",
        )}
      >
        <span
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-white" : "text-white/40",
          )}
        >
          {icon}
        </span>
        <span className="text-[12.5px] leading-none">{item}</span>
      </div>
    </Link>
  );
};

export default SidebarTab;
