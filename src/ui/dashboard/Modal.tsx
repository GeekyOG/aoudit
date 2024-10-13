import { X } from "lucide-react";
import React, { SetStateAction, useState } from "react";
import { cn } from "../../utils/cn";
import Button from "../Button";

interface DialogContainerProps {
  setDialogOpen: (value: SetStateAction<boolean>) => void;
  title: string;
  btnText: string;
  description: string;
  action: () => void;
  type: string;
  image: string;
  isLoading: boolean;
}

function DialogContainer({
  setDialogOpen,
  title,
  description,
  action,
  btnText,
  type,
  image,
  isLoading,
}: DialogContainerProps) {
  return (
    <div className="z-[100] fixed top-0 right-0 left-0 bottom-0 bg-[#0000005f] flex justify-center items-center">
      <div className="w-[480px] overflow-hidden p-0 bg-[#fff] rounded-[10px]">
        <div>
          <div
            className={cn(
              "relative h-[223px]  px-[28px] pt-[28px]",
              type == "delete" && "bg-[#FEF5F5]",
              type == "archive" && "bg-[#FFF8E5]"
            )}
          >
            <div
              className={cn(
                "ml-auto flex h-[48px] w-[48px]  items-center justify-center rounded-[8px] border-[1px] cursor-pointer",
                (type = "archive" && "border-[#FFE299]"),
                (type = "delete" && "border-[#FA9E9E]")
              )}
              onClick={() => setDialogOpen(false)}
            >
              <X
                className={cn(
                  (type = "archive" && "text-[#FFE299] "),
                  (type = "delete" && "text-[#FA9E9E]")
                )}
              />
            </div>
            <img
              src={image}
              alt=""
              className="absolute bottom-0 left-0 right-0 mx-auto h-[140px]"
            />
          </div>
          <p className="pt-[48px] font-[600] text-center">{title}</p>
          <p className="mx-auto max-w-[396px] text-center font-[400] text-[#55555C]">
            {description}
          </p>
        </div>
        <div className="mt-[92px] flex justify-center gap-4 border-t-[1px] py-[28px]">
          <Button
            isLoading={isLoading}
            className="w-[208px]"
            type="submit"
            onClick={() => action()}
          >
            {btnText}
          </Button>
          <Button
            onClick={() => setDialogOpen(false)}
            className="w-[208px] border-[1px] border-[#CCCCCE] bg-transparent text-[#55555C] hover:bg-transparent"
            type="submit"
          >
            No, Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DialogContainer;
