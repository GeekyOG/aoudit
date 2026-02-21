import { X, Clock, User, Activity } from "lucide-react";
import React, { SetStateAction } from "react";
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

  const actionColor = {
    CREATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    UPDATE: "bg-amber-50 text-amber-700 border-amber-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="z-[100] fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
      <div
        className="w-full max-w-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Activity size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-[15px]">
                Audit Log
              </h2>
              {data && (
                <span
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                    actionColor[data.action] ??
                      "bg-gray-50 text-gray-600 border-gray-200",
                  )}
                >
                  {data.action}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setDialogOpen(false)}
            className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Meta info bar */}
        {data && !isFetching && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-5 text-[12px] text-gray-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <User size={12} />
              {data.changedBy}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {new Date(data.timestamp).toLocaleString()}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isFetching && (
            <div className="px-6 py-8 space-y-4">
              <Skeleton active paragraph={{ rows: 5 }} />
            </div>
          )}
          {!isFetching && data?.action === "CREATE" && (
            <CreateRecordDisplay activity={data} />
          )}
          {!isFetching && data?.action === "UPDATE" && (
            <UpdateRecordDisplay data={data} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <Button
            onClick={() => setDialogOpen(false)}
            className="w-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all rounded-xl h-10 font-medium text-sm"
            type="button"
          >
            Close
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

export default AuditModel;
