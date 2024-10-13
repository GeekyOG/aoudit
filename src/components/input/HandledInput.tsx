import clsx from "clsx";
import { Field, FieldProps } from "formik";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { FunctionComponent, useState } from "react";

interface HandledInputProps extends Partial<FieldProps> {
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
  // handleChange?: (e: string | React.ChangeEvent<unknown>) => void;
  fieldChange?: React.Dispatch<React.SetStateAction<string>>;
}

const HandledInput: FunctionComponent<HandledInputProps> = ({
  title,
  placeholder,
  type,
  className,
  width,
  errors,
  touched,
  name,
  fieldClassName,
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
        className={clsx(
          "text-[0.8125rem] font-[600] text-[#28333E] ",
          hasError ? "text-[#f00000]" : ""
        )}
      >
        {title}
      </p>
      <div className="relative">
        <Field
          type={isPassword ? "" : type}
          name={name}
          placeholder={placeholder}
          className={clsx(
            "bg-white border-2 py-[8px] border-[#F77F00] rounded-[12px] h-[60px] mt-[8px] px-[15px] text-[0.75rem]",
            width ?? "w-[100%]",
            hasError ? "border-[#f00000]" : "",
            fieldClassName
          )}
          {...rest}
        />
        {type === "password" && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 right-[10px] cursor-pointer"
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

export default HandledInput;
