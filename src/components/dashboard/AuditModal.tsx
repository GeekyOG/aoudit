import { X } from "lucide-react";
import React, { SetStateAction, useState } from "react";
import { cn } from "../../utils/cn";
import Button from "../../ui/Button";
import { useGetAuditQuery } from "../../api/audit";
import CreateRecordDisplay from "../../modules/audit/CreateModal";
import UpdateRecordDisplay from "../../modules/audit/UpdateRecordDisplay";
import { Skeleton } from "antd";

interface AuditModelProps {
  setDialogOpen: (value: SetStateAction<boolean>) => void;
  id: string;
}

function AuditModel({ setDialogOpen, id }: AuditModelProps) {
  const { data, isFetching } = useGetAuditQuery(id);

  return (
    <div className="z-[100] fixed top-0 right-0 left-0 bottom-0 bg-[#0000005f] flex justify-center items-center">
      <div className="w-[480px] h-[80vh] overflow-y-scroll p-0 bg-[#fff] rounded-[10px]">
        <div>
          <div className={cn("relative h-[223px]  px-[28px] pt-[28px]")}>
            <div
              className={cn(
                "ml-auto flex h-[48px] w-[48px]  items-center justify-center rounded-[8px] border-[1px] cursor-pointer"
              )}
              onClick={() => setDialogOpen(false)}
            >
              <X className={cn("text-[#FA9E9E]")} />
            </div>
          </div>

          <div className="-mt-[100px]">
            {isFetching && <Skeleton className="w-[80%] mx-auto py-4" />}
            {data?.action == "CREATE" && (
              <CreateRecordDisplay activity={data} />
            )}

            {data?.action == "UPDATE" && <UpdateRecordDisplay data={data} />}
          </div>
        </div>
        <div className=" flex justify-center gap-4 border-t-[1px] py-[28px]">
          <Button
            onClick={() => setDialogOpen(false)}
            className="w-[208px] border-[1px] border-[#CCCCCE] bg-transparent text-[#55555C] hover:bg-transparent"
            type="submit"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuditModel;
