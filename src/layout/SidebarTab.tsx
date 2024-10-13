import type { FunctionComponent, ReactNode } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import React from "react";

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
  return (
    <Link to={`${url}`}>
      <div
        className={clsx(
          "px-[28px]",
          activeOption == url ? "border-r-[6px] border-[#E1BAAC]" : ""
        )}
      >
        <div
          className={clsx(
            "flex h-[56px] items-center gap-[10px] px-[14px]",
            activeOption == url
              ? "rounded-[8px] bg-[#fff] font-[500] text-[#E1BAAC]"
              : "font-[300]"
          )}
        >
          {icon}

          <p className={clsx("text-[0.813rem] leading-[22.4px]")}>{item}</p>
        </div>
      </div>
    </Link>
  );
};

export default SidebarTab;
