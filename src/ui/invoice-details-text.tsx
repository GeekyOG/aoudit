import React from "react";
import { cn } from "../utils/cn";

interface InvoiceDetailsTextProps {
  className?: string;
  text: string;
}

function InvoiceDetailsText({ text, className }: InvoiceDetailsTextProps) {
  return (
    <p className={cn("text-[0.6255rem] text-[#000]", className)}>{text}</p>
  );
}

export default InvoiceDetailsText;
