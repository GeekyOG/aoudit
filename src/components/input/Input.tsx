import clsx from "clsx";
import { Field, FieldProps } from "formik";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { FunctionComponent, useState } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends Partial<FieldProps> {
  title: string;
  errors: unknown;
  name: string;
  touched: unknown;
  type?: string;
  placeholder?: string;
  value?: string;
  className?: string;
  fieldClassName?: string;
  width?: string;
  as?: string;
  smallTitle?: boolean;
  // handleChange?: (e: string | React.ChangeEvent<unknown>) => void;
  fieldChange?: React.Dispatch<React.SetStateAction<string>>;
  pattern?: string;
}

const Input: FunctionComponent<InputProps> = ({
  title,
  placeholder,
  type,
  className,
  width,
  errors,
  touched,
  name,
  fieldClassName,
  pattern,
  smallTitle,
  ...rest
}) => {
  const hasError = errors && touched;

  const [isPassword, setIsPassword] = useState(false);

  const toggleType = () => {
    setIsPassword(!isPassword);
  };
  return (
    <div className={className}>
      <p
        className={cn(
          "text-[0.865rem] font-[500] text-[#28333E] ",
          hasError ? "text-[#f00000]" : "",
          smallTitle && "text-[0.75rem]"
        )}
      >
        {title}
      </p>
      <div className="relative">
        <Field
          type={isPassword ? "" : type}
          name={name}
          placeholder={placeholder}
          // pattern={pattern ?? ""}
          className={clsx(
            "mt-[8px] h-[56px] rounded-[12px] border-[1px] bg-[#fff] px-[15px] text-[0.75rem]",
            width ?? "w-[100%]",
            hasError ? "border-[#f00000]" : "",
            fieldClassName
          )}
          {...rest}
        />
        {type === "password" && (
          <div
            className="absolute right-[10px] top-1/2 -translate-y-1/2 transform cursor-pointer"
            onClick={toggleType}
          >
            {isPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        )}
      </div>
      {hasError ? (
        <div className="ml-[2px]">
          <p className="text-[12px] font-[400] text-[#f00000]">
            {String(errors || "Error")}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Input;
