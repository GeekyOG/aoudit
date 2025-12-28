import React, { useEffect } from "react";
import { Printer, Store, Calendar, Clock, User } from "lucide-react";
import { useLazyGetOrderQuery } from "../../api/ordersApi";

export default function ModernReceipt({ id }: { id: string }) {
  const [getOrder, { data, isLoading }] = useLazyGetOrderQuery();

  useEffect(() => {
    if (id) getOrder(id);
  }, [id, getOrder]);

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

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (n: number) =>
    `₦${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:bg-white">
      {/* Print Button */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          <Printer size={18} /> Print Receipt
        </button>
      </div>

      {/* RECEIPT */}
      <div
        id="receipt-print-area"
        className="max-w-2xl mx-auto bg-white p-8 shadow-xl print:shadow-none print:p-4"
      >
        {/* HEADER */}
        <div className="receipt-section text-center border-b border-dashed pb-4 mb-4">
          <img src="/assets/logo.jpeg" className="w-[100px] mx-auto" />
          <h1 className="text-2xl font-bold">Sammy Tech</h1>
          <p className="text-sm text-slate-500">
            No 1 Okorodafe street, Ughelli, Delta State·
          </p>
          <p className="text-sm text-slate-500">+234 703 878 4788</p>
        </div>

        {/* INVOICE INFO */}
        <div className="receipt-section flex justify-between text-sm mb-4">
          <div>
            <p className="text-slate-500">Invoice No</p>
            <p className="font-mono font-semibold">{sale.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="flex items-center gap-1 justify-end">
              <Calendar size={12} /> {formatDate(sale.date)}
            </p>
            {/* <p className="flex items-center gap-1 justify-end">
              <Clock size={12} /> {formatTime(sale.createdAt)}
            </p> */}
          </div>
        </div>

        {/* CUSTOMER */}
        {customer && (
          <div className="receipt-section bg-slate-50 p-2 rounded mb-4">
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <User size={12} /> Customer
            </p>
            <div className="flex justify-between">
              <div>
                <p className="font-medium">
                  {customer.first_name} {customer.last_name}
                </p>
              </div>

              <div>
                {customer.phone_number && (
                  <p className="text-sm">{customer.phone_number}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ITEMS */}
        <div className="receipt-items">
          <div className="grid grid-cols-12 text-xs font-semibold border-b pb-1 mb-1">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {data.map((item: any, i: number) => (
            <div
              key={i}
              className="receipt-item-row grid grid-cols-12 py-1 border-b text-sm"
            >
              <div className="col-span-6">
                <p className="font-medium">{item.Product.product_name}</p>
                {item.serial_number && (
                  <p className="text-xs text-slate-500">
                    S/N: {item.serial_number}
                  </p>
                )}
              </div>
              <div className="col-span-2 text-center">1</div>
              <div className="col-span-2 text-right">
                {formatCurrency(item.amount)}
              </div>
              <div className="col-span-2 text-right">
                {formatCurrency(item.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="receipt-section pt-4">
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
        <div className="receipt-section text-center text-xs mt-6 pt-4 border-t border-dashed">
          <p className="font-semibold">Thank you for your purchase!</p>
          <p>Please retain this receipt</p>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="space-x-px">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="inline-block bg-slate-800"
                style={{
                  width: Math.random() > 0.5 ? "2px" : "4px",
                  height: "50px",
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-slate-500 mt-2 font-mono">
          {sale.invoiceNumber}
        </p>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible;
          }

          #receipt-print-area {
            position: static;
            margin: 0 auto;
          }

          .receipt-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .receipt-item-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .receipt-items {
            break-inside: auto;
            page-break-inside: auto;
          }

          @page {
            size: A4;
            margin: 1cm;
          }
        }

         
          /* Ensure backgrounds print */
          .bg-blue-600,
          .bg-slate-50,
          .bg-blue-50,
          .bg-green-100,
          .bg-yellow-100,
          .bg-red-100 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Ensure text colors print */
          .text-white,
          .text-slate-800,
          .text-slate-600,
          .text-slate-500,
          .text-blue-600,
          .text-green-800,
          .text-yellow-800,
          .text-red-600 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Ensure borders print */
          .border-slate-300,
          .border-slate-200,
          .border-slate-100,
          .border-dashed {
            border-color: #cbd5e1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

        /* Force barcode to print */
          .bg-slate-800 {
            background-color: #1e293b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
      `}</style>
    </div>
  );
}
