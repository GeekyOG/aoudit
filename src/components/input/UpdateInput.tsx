import clsx from "clsx";
import {
  Field,
  FieldProps,
  FormikErrors,
  FormikTouched,
  useFormikContext,
} from "formik";
import { FunctionComponent, useEffect } from "react";

interface UpdateInputProps extends Partial<FieldProps> {
  title: string;
  errors:
    | string
    | string[]
    | FormikErrors<unknown>
    | FormikErrors<unknown>[]
    | undefined;
  name: string;
  touched:
    | boolean
    | undefined
    | FormikTouched<unknown>
    | FormikTouched<unknown>[]
    | undefined;
  type?: string;
  placeholder?: string;
  value?: string;
  className?: string;
  fieldClassName?: string;
  width?: string;
  as?: string;
  handleChange?: (e: string | React.ChangeEvent<unknown>) => void;
  fieldChange?: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

const UpdateInput: FunctionComponent<UpdateInputProps> = ({
  title,
  placeholder,
  type = "text",
  className,
  width,
  errors,
  touched,
  name,
  fieldClassName,
  handleChange,
  fieldChange,
  value,
  disabled,
  ...rest
}) => {
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    if (value) {
      setFieldValue(name, value);
    }
  }, [value, name, setFieldValue]);

  const hasError = errors && touched;

  return (
    <div className={className}>
      <p
        className={clsx(
          "text-[0.8125rem] font-[600] text-[#28333E]",
          hasError ? "text-[#f00000]" : ""
        )}
      >
        {title}
      </p>
      <Field
        disabled={disabled}
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (handleChange) {
            handleChange(e);
          }
          if (fieldChange) {
            fieldChange(e.target.value);
          }
        }}
        className={clsx(
          "bg-[transparent] border-[1px] rounded-[8px] h-[42px] mt-[8px] px-[15px] text-[0.75rem]",
          width ?? "lg:w-[400px] w-[100%]",
          hasError ? "border-[#f00000]" : "",
          fieldClassName
        )}
        {...rest}
      />
      {hasError ? (
        <div className="ml-[2px]">
          <p className="text-[12px] font-[400] text-[#f00000]">
            {typeof errors === "string" ? errors : "Error"}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default UpdateInput;
