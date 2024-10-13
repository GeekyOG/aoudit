import Papa from "papaparse";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { RefObject } from "react";
interface handleExportCSVProps {
  data: any[];
  fileName: string;
}

export const handleExportCSV = ({ data, fileName }: handleExportCSVProps) => {
  const filteredData = data.map(({ ...rest }) => rest);

  const csv = Papa.unparse(filteredData);

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
