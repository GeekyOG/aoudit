import { FunctionComponent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  CircleCheck,
  CloudDownload,
  DotIcon,
  Eye,
  Mail,
  Pen,
  PlaneTakeoff,
  Trash2,
} from "lucide-react";
import React from "react";
import { BiDotsHorizontal } from "react-icons/bi";

interface ITableActionButtonsProps {
  setShow?: () => void;
  id?: string;
  handleEdit?: () => void;
  handleDelete?: () => void;
  handleSave?: () => void;
  handleSend?: () => void;
  handleClear?: () => void;
  handleConfirm?: () => void;
  clearanceStatus?: string;
  status?: string;
  isRowHovered?: boolean;
  hasEditPermission?: boolean;
  hasDeletePermission?: boolean;
  hasViewPermission?: boolean;
  hasClearPermission?: boolean;
}

const TableActionButtons: FunctionComponent<ITableActionButtonsProps> = ({
  setShow,
  handleEdit,
  handleDelete,
  handleSend,
  handleClear,
  handleConfirm,
  handleSave,
  clearanceStatus,
  isRowHovered,
  status,
  hasEditPermission = true,
  hasDeletePermission = true,
  hasViewPermission = true,
  hasClearPermission = true,
}: ITableActionButtonsProps) => {
  const [showActions, setShowActions] = useState(false);
  const hoverTimeout = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    setShowActions(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
      }
    };
  }, []);

  // Each action slot is 40px wide (px-[20px] each side = 40px per icon)
  const ACTION_WIDTH = 40;

  const actions = [
    {
      show: setShow && hasViewPermission,
      el: <Eye className="w-[10px] cursor-pointer" />,
      onClick: setShow,
      borderRight: true,
    },
    {
      show: handleEdit && hasEditPermission,
      el: <Pen className="w-[10px] cursor-pointer" />,
      onClick: handleEdit,
      borderRight: true,
    },
    {
      show: handleClear && hasClearPermission && clearanceStatus !== "CLEARED",
      el: <PlaneTakeoff className="w-[10px] cursor-pointer" />,
      onClick: handleClear,
      borderRight: true,
    },
    {
      show: handleSave,
      el: <CloudDownload className="w-[10px] cursor-pointer" />,
      onClick: handleSave,
      borderRight: true,
    },
    {
      show: handleSend,
      el: <Mail className="w-[10px] cursor-pointer" />,
      onClick: handleSend,
      borderRight: true,
    },
    {
      show: handleConfirm && status !== "SUCCESS",
      el: <CircleCheck className="w-[10px] cursor-pointer" />,
      onClick: handleConfirm,
      borderRight: true,
    },
    {
      show: handleDelete && hasDeletePermission,
      el: <Trash2 className="w-[10px] cursor-pointer" />,
      onClick: handleDelete,
      borderRight: false,
    },
  ];

  const visibleActions = actions.filter((a) => !!a.show);
  const totalWidth = visibleActions.length * ACTION_WIDTH;
  // Center the menu over the trigger by shifting left by totalWidth, nudge 3px up
  const leftOffset = -totalWidth;

  return (
    <div className="relative z-[100]">
      <div
        className="bg-neutral-450 cursor-pointer p-[10px] rounded max-w-[40px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <BiDotsHorizontal className="text-neutral-50 mx-auto" />
      </div>

      {(showActions || isRowHovered) && (
        <div
          className="absolute bg-white h-[40px] flex border -top-[] border-gray-200 items-center rounded-[4px] overflow-hidden shadow-md z-10"
          style={{ left: leftOffset, top: -3, width: totalWidth }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {visibleActions.map((action, i) => (
            <div
              key={i}
              onClick={action.onClick || (() => {})}
              className={clsx(
                "flex items-center justify-center w-[40px] h-full flex-none cursor-pointer text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors",
                action.borderRight &&
                  i < visibleActions.length - 1 &&
                  "border-r border-gray-200",
              )}
            >
              {action.el}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableActionButtons;
