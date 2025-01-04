import React, { Dispatch, SetStateAction, useState } from "react";
import Button from "../../ui/Button";
import AddInvoiceForm from "./AddInvoiceForm";
import { X } from "lucide-react";
import ViewInvoice from "./ViewInvoice";

function InvoiceModal({
  setDialogOpen,
  view,
  id,
  sn,
  description,
  size,
}: {
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  view?: boolean;
  id?: string;
  sn?: string;
  description?: string;
  size?: string;
}) {
  return (
    <div className="fixed left-0 right-0 top-0 z-[100] h-[100vh] overflow-y-scroll bg-[#00000065] px-[28px] pt-[48px] flex justify-center pb-[28px]">
      <div>
        <div className="rounded-[12px] bg-[#fff] min-w-[500px]  max-w-[800px]">
          <div className="flex items-center justify-between border-b-[1px] border-[#DDDDDD] px-[24px] py-[12px]">
            <div className="flex items-center gap-[27px]">
              <button
                className="p-[12px] rounded-[50%]  bg-[#e3e3e3]"
                onClick={() => setDialogOpen(false)}
              >
                <X size={14} />
              </button>

              <p className="text-[0.688rem] font-[700] tracking-[0.5px] text-[#98A2B3]">
                Create Invoice
              </p>
            </div>

            <div className="flex gap-[8px]"></div>
          </div>

          <div className="flex">
            <div className="w-[50%] px-[26px] py-[57px]">
              <div className="max-w-[277px] border-b-[1px] pb-[8px]">
                <p className="font-[600]">Invoice info</p>
              </div>
              <div className="mt-[24px]  min-h-[100vh]">
                {view && (
                  <ViewInvoice setDialogOpen={setDialogOpen} id={id ?? ""} />
                )}

                {!view && (
                  <AddInvoiceForm
                    setDialogOpen={setDialogOpen}
                    sn={sn}
                    id={id}
                    description={description}
                    size={size}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;
