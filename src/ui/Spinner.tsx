import clsx from "clsx";
import React from "react";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <img
      src="/assets/spinner.svg"
      alt=""
      className={clsx("h-[30px] w-[30px] mx-auto", className)}
    />
  );
}
