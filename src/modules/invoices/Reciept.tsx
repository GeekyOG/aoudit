import React, { useEffect, useRef } from "react";
import { Printer, Calendar, User, Download } from "lucide-react";
import { useLazyGetOrderQuery } from "../../api/ordersApi";
import { useReactToPrint } from "react-to-print";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { ToWords } from "to-words";
import { getDecimalPart } from "../../utils/format";

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    borderBottom: "1 dashed #000",
    paddingBottom: 15,
    marginBottom: 15,
  },
  logo: {
    width: 150,
    height: 50,
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    marginBottom: 2,
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 9,
  },
  customerBox: {
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 4,
    marginBottom: 15,
  },
  customerLabel: {
    fontSize: 8,
    color: "#666",
    marginBottom: 3,
  },
  customerName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #ccc",
    paddingVertical: 8,
  },
  col1: { width: "50%" },
  col2: { width: "20%", textAlign: "center" },
  col3: { width: "30%", textAlign: "right" },
  itemName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 8,
    color: "#666",
    marginBottom: 1,
  },
  totalsSection: {
    marginTop: 15,
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #000",
    paddingTop: 8,
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    fontSize: 8,
    marginTop: 20,
    paddingTop: 15,
    borderTop: "1 dashed #000",
  },
  termsPage: {
    padding: 30,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  warrantyBox: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 4,
    marginBottom: 30,
  },
  warrantyTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 11,
  },
  warrantyText: {
    marginBottom: 5,
    fontSize: 10,
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
  },
  signatureBox: {
    width: "45%",
  },
  signatureLine: {
    borderTop: "2 solid #000",
    paddingTop: 8,
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  signatureName: {
    fontSize: 8,
    color: "#666",
  },
});

// PDF Document Component
const ReceiptPDF = ({ data, sale, customer }: any) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatCurrency = (n: number) =>
    `N${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const toWords = new ToWords({ localeCode: "en-US" });
  const kobo = getDecimalPart(Number(sale.total_paid) ?? 0);

  return (
    <Document>
      {/* Page 1 - Receipt */}
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Image
            src="/assets/logo.png"
            style={{
              width: 150,

              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: 10,
            }}
          />

          <Text style={pdfStyles.companyName}>SAMMYTECH GADGETS</Text>
          <Text style={pdfStyles.companyInfo}>
            Quality Phones . laptops . Accessories
          </Text>
          <Text style={pdfStyles.companyInfo}>
            01 okorodafe Round About, Ughelli Delta State
          </Text>
          <Text style={pdfStyles.companyInfo}>+234 703 878 4788</Text>
        </View>

        {/* Invoice Info */}
        <View style={pdfStyles.invoiceInfo}>
          <View>
            <Text style={{ color: "#666" }}>Invoice No</Text>
            <Text style={{ fontWeight: "bold" }}>{sale.invoiceNumber}</Text>
          </View>
          <Text>{formatDate(sale.date)}</Text>
        </View>

        {/* Customer */}
        {customer && (
          <View style={pdfStyles.customerBox}>
            <Text style={pdfStyles.customerLabel}>Customer</Text>
            <Text style={pdfStyles.customerName}>
              {customer.first_name} {customer.last_name}
            </Text>
            {customer.phone_number && (
              <Text style={{ fontSize: 9 }}>{customer.phone_number}</Text>
            )}
          </View>
        )}

        {/* Items Table */}
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.col1}>Item</Text>
          <Text style={pdfStyles.col2}>Qty</Text>
          <Text style={pdfStyles.col3}>Price</Text>
        </View>

        {data.map((item: any, i: number) => (
          <View key={i} style={pdfStyles.tableRow}>
            <View style={pdfStyles.col1}>
              <Text style={pdfStyles.itemName}>
                {item.Product.product_name}
              </Text>
              {item.serial_number && (
                <Text style={pdfStyles.itemDetail}>
                  S/N: {item.serial_number}
                </Text>
              )}
              {item.description && (
                <Text style={pdfStyles.itemDetail}>
                  Description: {item.description}
                </Text>
              )}
            </View>
            <Text style={pdfStyles.col2}>1</Text>
            <Text style={pdfStyles.col3}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={pdfStyles.totalsSection}>
          <View style={pdfStyles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(sale.total_amount)}</Text>
          </View>
          <View style={pdfStyles.totalRowBold}>
            <Text>Total</Text>
            <Text>{formatCurrency(sale.total_amount)}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text>Paid</Text>
            <Text>{formatCurrency(sale.total_paid)}</Text>
          </View>
          <Text>
            {" "}
            {`${toWords?.convert(Number(sale.total_paid.toFixed(0)))} Naira ${
              kobo && `${toWords?.convert(Number(kobo))} Kobo`
            } Only`}
          </Text>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={{ fontWeight: "bold", marginBottom: 3 }}>
            Thank you for your purchase!
          </Text>
          <Text>Please retain this receipt</Text>
        </View>
      </Page>

      {/* Page 2 - Terms & Conditions */}
      <Page size="A4" style={pdfStyles.termsPage}>
        <Text style={pdfStyles.termsTitle}>Terms & Conditions</Text>

        <View style={pdfStyles.warrantyBox}>
          <Text style={pdfStyles.warrantyTitle}>WARRANTY POLICY</Text>
          <Text style={pdfStyles.warrantyText}>14 Days for UK Used Phones</Text>
          <Text style={pdfStyles.warrantyText}>
            30 Days for Brand New Phones
          </Text>
          <Text
            style={{
              ...pdfStyles.warrantyText,
              marginTop: 10,
              fontWeight: "bold",
            }}
          >
            No warranty covers liquid damage or screen damage.
          </Text>
        </View>

        <View style={pdfStyles.signaturesContainer}>
          <View style={pdfStyles.signatureBox}>
            <View style={pdfStyles.signatureLine}>
              <Text style={pdfStyles.signatureLabel}>Customer's Signature</Text>
              <Text style={pdfStyles.signatureName}>
                {customer
                  ? `${customer.first_name} ${customer.last_name}`
                  : "Customer Name"}
              </Text>
            </View>
          </View>
          <View style={pdfStyles.signatureBox}>
            <View style={pdfStyles.signatureLine}>
              <Text style={pdfStyles.signatureLabel}>Seller's Signature</Text>
              <Text style={pdfStyles.signatureName}>Sammytech Gadgets</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

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

  const handleDownloadPDF = async () => {
    if (!data || data.length === 0) return;

    const sale = data[0].Sale;
    const customer = sale.Customer;

    const blob = await pdf(
      <ReceiptPDF data={data} sale={sale} customer={customer} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${sale.invoiceNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
  const toWords = new ToWords({ localeCode: "en-US" });
  const kobo = getDecimalPart(Number(sale.total_paid) ?? 0);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mb-4 print:hidden">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Download size={18} /> Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
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
            <img src="/assets/logo.png" className="w-[200px] mx-auto" />
            <h1 className="text-2xl font-bold">SAMMYTECH GADGETS</h1>
            <p className="text-sm text-black font-[600]">
              Quality Phones . laptops . Accessories
            </p>
            <p className="text-sm text-black font-[600]">
              01 okorodafe Round About, Ughelli Delta State
            </p>
            <p className="text-sm text-black font-[600]">+234 703 878 4788</p>
          </div>

          {/* INVOICE INFO */}
          <div className="flex justify-between text-sm mb-4">
            <div>
              <p className="text-black">Invoice No</p>
              <p className="font-mono font-semibold">{sale.invoiceNumber}</p>
            </div>
            <div className="text-right flex items-center gap-1">
              <Calendar size={12} /> {formatDate(sale.date)}
            </div>
          </div>

          {/* CUSTOMER */}
          {customer && (
            <div className="bg-slate-50 p-2 rounded mb-4">
              <p className="text-xs text-black flex items-center gap-1">
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
                    <p className="text-xs text-black">
                      S/N: {item.serial_number}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-black">
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
            {`${toWords?.convert(Number(sale.total_paid.toFixed(0)))} Naira ${
              kobo && `${toWords?.convert(Number(kobo))} Kobo`
            } Only`}
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
                <p className="text-sm font-semibold">Customer's Signature</p>
                <p className="text-xs text-black mt-1">
                  {customer
                    ? `${customer.first_name} ${customer.last_name}`
                    : "Customer Name"}
                </p>
              </div>
            </div>
            <div>
              <div className="border-t-2 border-slate-800 pt-2">
                <p className="text-sm font-semibold">Seller's Signature</p>
                <p className="text-xs text-black mt-1">Sammytech Gadgets</p>
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
