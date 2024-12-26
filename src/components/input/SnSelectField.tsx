import { Spin } from "antd";
import clsx from "clsx";
import { ChevronsUpDown } from "lucide-react";
import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface SelectFieldProps {
  hideSearch?: boolean;

  serialCodesForProducts: {
    [key: string]: any[];
  };
  className?: string;
  snIndex: number;
  values: {
    customerId: string;
    items: {
      id: string;
      sn: string;
      amount: number;
      amountPaid: number;
    }[];
  };
  searchPlaceholder?: string;
  setFieldValue: Function;
  isLoading?: boolean;
  width?: string;
  options: any[];
  productsData: any;
  providedSN?: { serial_number: string; productId: string };
  // setSelectedSerialNumbers: (value: any) => void;
}

const SelectField: FunctionComponent<SelectFieldProps> = ({
  className,
  width,
  serialCodesForProducts,
  setFieldValue,
  snIndex,
  isLoading,
  searchPlaceholder,
  hideSearch,
  options,
  productsData,
  values,
  providedSN,
  // setSelectedSerialNumbers,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [snValue, setSnValue] = useState<{
    serial_number: string;
    productId: string;
  }>();

  const handleSerialNumberChange = (
    value: string,
    index: number,
    setFieldValue: Function
  ) => {
    const newSerialNumber = value;
    const selectedCode = serialCodesForProducts[index]?.find(
      (item) => item.serial_number === value
    );

    // Add the new serial number to the selected list
    if (selectedCode) {
      // setSelectedSerialNumbers((prevSelected) => [...values.items]);

      // Set the product ID and serial number
      setFieldValue(`items[${index}].id`, selectedCode.productId);
      setFieldValue(`items[${index}].sn`, selectedCode.serial_number);

      // Update the amount with the selected product's sales price
      const selectedProduct = productsData.find(
        (product) => product.id === selectedCode.productId
      );
      setFieldValue(
        `items[${index}].description`,
        selectedProduct?.description
      );
      setFieldValue(
        `items[${index}].amount`,
        selectedProduct?.sales_price || 0
      );
    }

    setSnValue(selectedCode);
    toggleShowOptions();
  };

  const toggleShowOptions = () => {
    setShowOptions(!showOptions);
  };

  const optionsRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      optionsRef.current &&
      !optionsRef.current.contains(event.target as Node)
    ) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (providedSN) {
      setSnValue(providedSN);
    }
  }, [providedSN]);

  const handleInputChange = (e: { target: { value: string } }) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const filteredOptions = useMemo(() => {
    return options?.filter((item) =>
      item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className={clsx("cursor-pointer ", className)} ref={optionsRef}>
      <div
        className={clsx(
          "relative bg-[transparent] border-[1px] rounded-[8px] h-[42px]  px-[4px] flex items-center justify-between",
          width ?? "w-[150px]"
        )}
      >
        <div
          className="flex justify-between w-[100%] px-4px]"
          onClick={() => {
            toggleShowOptions();

            // providedSN?.serial_number !== "" ? null : toggleShowOptions();
          }}
        >
          <p className={clsx("text-[0.75rem] font-[500]")}>
            {snValue?.serial_number ?? searchPlaceholder}
          </p>
          <ChevronsUpDown size={16} />
        </div>

        {showOptions && options && (
          <div className="flex flex-col gap-[10px] bg-[#fff] absolute py-[8px] rounded-[4px] border-[1px] -top-[1px] -right-[1px] -left-[1px] z-[10] max-h-[300px] overflow-scroll no-scrollbar pb-[10px]">
            {!hideSearch && (
              <input
                placeholder={searchPlaceholder}
                className="bg-[#fff] rounded-[4px] border-[1px] p-[6px] text-[0.75rem] font-[500] hover:bg-[#e3e3e3] mx-[8px]"
                value={searchTerm}
                onChange={handleInputChange}
              />
            )}

            {filteredOptions
              ? filteredOptions.map((option, index) => (
                  <div
                    className="py-[8px] border-b-[1px] px-[8px] hover:bg-[#e3e3e3]"
                    key={index}
                    onClick={() =>
                      handleSerialNumberChange(
                        option.serial_number,
                        snIndex,
                        setFieldValue
                      )
                    }
                  >
                    <p className="text-[0.75rem] font-[500]">
                      {option?.serial_number}
                    </p>
                  </div>
                ))
              : options?.map((option, index) => (
                  <div
                    key={index}
                    className="py-[8px] border-b-[1px] px-[8px] hover:bg-[#e3e3e3]"
                    onClick={() =>
                      handleSerialNumberChange(
                        option.serial_number,
                        snIndex,
                        setFieldValue
                      )
                    }
                  >
                    <p className="text-[0.75rem] font-[500] ">
                      {option?.serial_number}
                    </p>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectField;
