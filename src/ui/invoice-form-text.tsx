import React from "react";
import { cn } from "../utils/cn";

interface InvoiceFormTextProps {
  className?: string;
  text: string;
}

function InvoiceFormText({ text, className }: InvoiceFormTextProps) {
  return (
    <p className={cn("text-[0.75rem] text-[#667085]", className)}>{text}</p>
  );
}

export default InvoiceFormText;
