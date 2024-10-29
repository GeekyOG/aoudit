import React, { useEffect, useRef } from "react";
import InvoiceDetailsText from "../../ui/invoice-details-text";
import InvoiceFormText from "../../ui/invoice-form-text";
import { columns } from "./invoice-colums";
import { Table } from "antd";
import { useLazyGetOrderQuery } from "../../api/ordersApi";
import { format } from "date-fns";
import DataLoading from "../../ui/DataLoading";
import { formatAmount } from "../../utils/format";

function InvoiceDetails({ id }: { id: string }) {
  const [getOrder, { data, isLoading }] = useLazyGetOrderQuery();

  useEffect(() => {
    getOrder(id);
  }, []);

  return (
    <div
      className="bg-[#fff] px-[24px] pb-[100px] pt-[18px]"
      style={{
        boxShadow: "0px 1px 10px 3px #0000000F",
      }}
    >
      {isLoading && (
        <div className="mt-[100px]">
          <DataLoading />
        </div>
      )}
      {!isLoading && data && (
        <>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-[4px]">
              <img src="/favicon.png" height={35} width={35} alt="" />
              <div>
                <p className="text-[0.75rem] font-[700] leading-[14.52px]">
                  Bees Gadget
                </p>
                {/* <p className="text-[0.625rem] text-[#717171]">
              sales@voliefinance.com
            </p> */}
              </div>
            </div>

            {/* <img src="/barcode.svg" height={75} width={75} alt="" /> */}
          </div>

          <div className="flex items-center gap-[4px]">
            <p className="font-[700] leading-[100%]">Invoice</p>
          </div>
          <InvoiceDetailsText
            text={`Invoice Number — ${data ? data[0]?.Sale.invoiceNumber : "--"}`}
          />
          <div className="mt-[4px] flex gap-[30px]">
            <InvoiceDetailsText
              text={`Issue date — ${data ? format(new Date(data[0]?.Sale.date), "dd, MMM, yyyy") : "--"}`}
            />
          </div>
          <div className="mt-[20px] flex justify-between">
            <div>
              <p className="text-[0.438rem] font-[700] text-[#777777]">
                BILLED FROM
              </p>

              <div className="mt-[10px]">
                <InvoiceFormText text={"Bees Gadget"} className="font-[800]" />

                {/* <InvoiceFormText text={"--"} />
            <InvoiceFormText text={` "--" , "--"},"--"}`} />
            <InvoiceFormText text={"--"} />
            <InvoiceFormText text={"--"} />
            <InvoiceFormText text={"--"} /> */}
              </div>
            </div>
            <div>
              <p className="text-[0.438rem] font-[700] text-[#777777]">
                Billed to
              </p>
              <div className="mt-[10px]">
                <InvoiceDetailsText
                  text={`${data[0].Sale.Customer.first_name} ${data[0].Sale.Customer.last_name}`}
                  className="max-w-[220px]"
                />

                <InvoiceDetailsText
                  text={`${data[0].Sale.Customer.email}`}
                  className="max-w-[220px]"
                />
                <InvoiceDetailsText
                  text={`${data[0].Sale.Customer.phone_number}`}
                />
                {/* <InvoiceDetailsText text="" />
            <InvoiceDetailsText text="" /> */}
              </div>
            </div>
          </div>

          <div className="mt-[70px]">
            <Table
              columns={columns}
              pagination={false}
              dataSource={data || []}
              className="w-[100%] border-[1px]"
              loading={isLoading}
              rowKey="id"
              rowClassName={() => "custom-table-row"}
            />
          </div>

          <div className="mt-[40px] flex justify-end">
            <div>
              <div className="flex max-w-[357px] gap-3 justify-between border-b-[1px] py-[10px]">
                <p className="text-[0.688rem]">Total </p>
                <p className="text-[0.688rem]">{`${formatAmount(data[0]?.Sale?.total_amount)}`}</p>
              </div>
              <div className="flex max-w-[357px] gap-3 justify-between border-b-[1px] py-[10px]">
                <p className="text-[0.688rem] font-[600]">Amount Due</p>
                <p className="text-[0.688rem] font-[600]">
                  {`${formatAmount(data[0]?.Sale?.total_amount)}`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default InvoiceDetails;
