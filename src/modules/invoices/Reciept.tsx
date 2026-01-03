import React, { useEffect, useRef } from "react";
import { Printer, Calendar, User } from "lucide-react";
import { useLazyGetOrderQuery } from "../../api/ordersApi";
import { useReactToPrint } from "react-to-print";

export default function ModernReceipt({ id }: { id: string }) {
  const [getOrder, { data, isLoading }] = useLazyGetOrderQuery();
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) getOrder(id);
  }, [id, getOrder]);

  const handleAfterPrint = React.useCallback(() => {
    console.log("`onAfterPrint` called");
  }, []);

  const handleBeforePrint = React.useCallback(() => {
    console.log("`onBeforePrint` called");
    return Promise.resolve();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: "SammyTechGadgetReceipt",
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading receipt...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No receipt data found
      </div>
    );
  }

  const sale = data[0].Sale;
  const customer = sale.Customer;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatCurrency = (n: number) =>
    `₦${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* PRINT BUTTON */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          <Printer size={18} /> Print Receipt
        </button>
      </div>

      {/* PRINTABLE AREA */}
      <div ref={receiptRef} className="space-y-6">
        {/* PAGE 1 */}
        <div className="max-w-2xl mx-auto bg-white p-8 shadow-xl print:shadow-none print:p-4">
          {/* HEADER */}
          <div className="text-center border-b border-dashed pb-4 mb-4">
            <img src="/assets/logo.jpeg" className="w-[150px] mx-auto" />
            <h1 className="text-2xl font-bold">SAMMYTECH GADGETS</h1>
            <p className="text-sm text-slate-500">
              Quality Phones . laptops . Accessories
            </p>
            <p className="text-sm text-slate-500">
              01 okorodafe Round About, Ughelli Delta State
            </p>
            <p className="text-sm text-slate-500">+234 703 878 4788</p>
          </div>

          {/* INVOICE INFO */}
          <div className="flex justify-between text-sm mb-4">
            <div>
              <p className="text-slate-500">Invoice No</p>
              <p className="font-mono font-semibold">{sale.invoiceNumber}</p>
            </div>
            <div className="text-right flex items-center gap-1">
              <Calendar size={12} /> {formatDate(sale.date)}
            </div>
          </div>

          {/* CUSTOMER */}
          {customer && (
            <div className="bg-slate-50 p-2 rounded mb-4">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <User size={12} /> Customer
              </p>
              <p className="font-medium">
                {customer.first_name} {customer.last_name}
              </p>
              {customer.phone_number && (
                <p className="text-sm">{customer.phone_number}</p>
              )}
            </div>
          )}

          {/* ITEMS */}
          <div>
            <div className="grid grid-cols-3 text-xs font-semibold border-b pb-1 mb-1">
              <div className="">Item</div>
              <div className=" text-center">Qty</div>
              <div className=" text-right">Price</div>
            </div>

            {data.map((item: any, i: number) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-2 py-1 border-b text-sm break-inside-avoid"
              >
                <div className="">
                  <p className="font-medium">{item.Product.product_name}</p>
                  {item.serial_number && (
                    <p className="text-xs text-slate-500">
                      S/N: {item.serial_number}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-500">
                      Description: {item.description}
                    </p>
                  )}
                </div>
                <div className=" text-center">1</div>
                <div className=" text-right">{formatCurrency(item.amount)}</div>
              </div>
            ))}
          </div>

          {/* TOTALS */}
          <div className="pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(sale.total_amount)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t mt-2 pt-2">
              <span>Total</span>
              <span>{formatCurrency(sale.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Paid</span>
              <span>{formatCurrency(sale.total_paid)}</span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center text-xs mt-6 pt-4 border-t border-dashed">
            <p className="font-semibold">Thank you for your purchase!</p>
            <p>Please retain this receipt</p>
          </div>
        </div>

        {/* PAGE 2 */}
        <div className="max-w-2xl mx-auto bg-white p-8 shadow-xl print:shadow-none print:p-4 print:page-break-before">
          <h2 className="text-xl font-bold text-center mb-4">
            Terms & Conditions
          </h2>

          <div className="bg-slate-50 p-4 rounded text-sm">
            <p className="font-semibold text-center mb-3">WARRANTY POLICY</p>
            <p>
              <strong>14 Days for UK Used Phones</strong>
            </p>
            <p>
              <strong>30 Days for Brand New Phones</strong>
            </p>
            <p className="mt-3 font-semibold ">
              No warranty covers liquid damage or screen damage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-12">
            <div>
              <div className="border-t-2 border-slate-800 pt-2">
                <p className="text-sm font-semibold">Customer’s Signature</p>
                <p className="text-xs text-slate-500 mt-1">
                  {customer
                    ? `${customer.first_name} ${customer.last_name}`
                    : "Customer Name"}
                </p>
              </div>
            </div>
            <div>
              <div className="border-t-2 border-slate-800 pt-2">
                <p className="text-sm font-semibold">Seller's Signature</p>
                <p className="text-xs text-slate-500 mt-1">Sammytech Gadgets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT SETTINGS */}
      <style>{`
        @page {
          size: A4;
          margin: 1cm;
        }

        @media print {
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
