import React, { FunctionComponent } from "react";

import Spinner from "./Spinner";
import { cn } from "../utils/cn";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
  type?: "submit" | "reset" | "button";
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  className,
  isLoading,
  onClick,
  type = "submit",
  ...props
}) => {
  return (
    <button
      disabled={isLoading}
      onClick={onClick || (() => {})}
      type={type}
      className={cn(
        "text-[#fff] outline-none border-0 bg-neutral-900 px-[20px] py-[10px]",
        className
      )}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
