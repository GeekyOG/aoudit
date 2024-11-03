import Papa from "papaparse";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { RefObject } from "react";
import { format } from "date-fns";
interface handleExportCSVProps {
  data: any[];
  fileName: string;
}

export const handleExportCSV = ({ data, fileName }: handleExportCSVProps) => {
  const headers = [
    "Customer",
    "Product Name",
    "Purchase Amount",
    "Amount Sold",
    "Profit",
    "Date",
  ];
  const filteredData = data.map(({ ...rest }) => {
    const customerNames =
      `${rest.Sale.Customer.first_name} ${rest.Sale.Customer.last_name}`.trim();
    const productName = rest.Product.product_name;
    const purchaseAmount = rest.Product.purchase_amount;
    const salesAmount = rest.Sale.total_paid;
    const profit = salesAmount - purchaseAmount;
    const date = format(new Date(rest.Sale.date), "dd, MMM, yyyy");

    // Return array of values for each row
    return [
      customerNames,
      productName,
      purchaseAmount,
      salesAmount,
      profit,
      date,
    ];
  });

  // Prepend headers as the first row
  const csvData = [headers, ...filteredData];

  // Logic to export `csvData` as a CSV file goes here

  const csv = Papa.unparse(csvData);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const handleDownload = (pdfRef: RefObject<HTMLDivElement>) => {
  const element = pdfRef?.current;
  if (!element) return;

  html2canvas(element)
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("invoice.pdf");
      toast.success("PDF generated successfully.");
    })
    .catch(() => {
      toast.error("Error generating PDF.");
    });
};
