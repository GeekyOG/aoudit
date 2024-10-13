import React from "react";
import { IoIosAdd } from "react-icons/io";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

interface DashboardBoxProps {
  title: string;
  value: number | string;
  action?: () => void;
  className?: string;
}

function DashboardBox({ title, value, action, className }: DashboardBoxProps) {
  return (
    <div
      className={cn(
        "shadow-md p-[20px] border-[1px] rounded-[8px] w-[100%]",
        className
      )}
    >
      <div className="flex justify-between">
        <p className="text-neutral-350">{title}</p>

        {action && (
          <button
            onClick={action}
            className="bg-neutral-350 p-[10px] rounded-[8px]"
          >
            <IoIosAdd className="text-[1.5rem]  text-neutral " />
          </button>
        )}
      </div>

      <p className="text-[1.25rem] font-[500] text-neutral-400">{value}</p>
    </div>
  );
}

export default DashboardBox;