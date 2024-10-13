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

  return (
    <div className="relative">
      <div
        className="bg-neutral-450 cursor-pointer p-[10px] rounded max-w-[40px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <BiDotsHorizontal className="text-neutral-50 mx-auto" />
      </div>

      {(showActions || isRowHovered) && (
        <div
          className={clsx(
            "absolute bg-[#fff] w-[full] h-[40px] right-4 -top-[3px]  flex border-[1px] justify-evenly items-center rounded-[4px] overflow-hidden"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {setShow && hasViewPermission && (
            <div
              className="px-[20px] flex-none border-r-[1px] "
              onClick={setShow || (() => {})}
            >
              <Eye className="w-[10px] cursor-pointer" />
            </div>
          )}
          {handleEdit && hasEditPermission && (
            <div
              className="px-[20px] flex-none border-r-[1px]"
              onClick={handleEdit || (() => {})}
            >
              <Pen className="w-[10px] cursor-pointer" />
            </div>
          )}
          {handleClear &&
            hasClearPermission &&
            clearanceStatus !== "CLEARED" && (
              <div className="px-[20px] flex-none border-r-[1px]">
                <PlaneTakeoff
                  className="w-[10px] cursor-pointer"
                  onClick={handleClear || (() => {})}
                />
              </div>
            )}

          {handleSave && (
            <div className="px-[20px] flex-none border-r-[1px]">
              <CloudDownload
                className="w-[10px] cursor-pointer"
                onClick={handleSave || (() => {})}
              />
            </div>
          )}

          {handleSend && (
            <div className="px-[20px] flex-none border-r-[1px]">
              <Mail
                className="w-[10px] cursor-pointer"
                onClick={handleSend || (() => {})}
              />
            </div>
          )}

          {handleConfirm && status !== "SUCCESS" && (
            <div className="px-[20px] flex-none border-r-[1px]">
              <CircleCheck
                className="w-[10px] cursor-pointer "
                onClick={handleConfirm || (() => {})}
              />
            </div>
          )}

          {handleDelete && hasDeletePermission && (
            <div
              onClick={handleDelete || (() => {})}
              className="px-[20px] flex-none  "
            >
              <Trash2 className="w-[10px] cursor-pointer " />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableActionButtons;
