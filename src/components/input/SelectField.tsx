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
  title: string;
  className?: string;
  selected: string;
  searchPlaceholder?: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  setId: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  width?: string;
  smallTitle?: boolean;
  options?: {
    name: string;
    id: string;
    invoiceEmail?: string;
    email?: string;
  }[];
  error?: boolean;
}

const SelectField: FunctionComponent<SelectFieldProps> = ({
  title,
  className,
  options,
  width,
  selected,
  setSelected,
  error,
  setId,
  isLoading,
  searchPlaceholder,
  hideSearch,
  smallTitle,
}) => {
  const [showOptions, setShowOptions] = useState(false);

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

  const handleSetSelected = (selected: string, id: string) => {
    setSelected(selected);
    setId(id);
    setShowOptions(false);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: { target: { value: string } }) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const filteredOptions = useMemo(() => {
    return options?.filter((item) =>
      item?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }, [options, searchTerm]);

  return (
    <div className={clsx("cursor-pointer ", className)} ref={optionsRef}>
      <p
        className={clsx(
          "text-[0.875rem] font-[600]",
          selected == "Select an option" && error && "text-[#f00000]",
          smallTitle && "text-[0.75rem]"
        )}
      >
        {title}
      </p>
      <div
        className={clsx(
          "relative bg-[transparent] border-[1px] rounded-[12px] h-[42px] mt-[8px] px-[15px] flex items-center justify-between",
          width ?? "w-[100%]",
          selected == "Select an option" && error && "border-[#f00000]"
        )}
      >
        <div
          className="flex justify-between w-[100%]"
          onClick={toggleShowOptions}
        >
          <p
            className={clsx(
              "text-[0.75rem] font-[500]",
              selected == "Select an option" && error && "text-[#f00000]"
            )}
          >
            {selected}
          </p>
          <ChevronsUpDown />
        </div>

        {showOptions && options && (
          <div className="flex flex-col gap-[10px] bg-[#fff] absolute py-[20px] rounded-[8px] border-[1px] -top-[1px] -right-[1px] -left-[1px] z-[10] max-h-[300px] overflow-scroll no-scrollbar pb-[10px]">
            {!hideSearch && (
              <input
                placeholder={searchPlaceholder}
                className="bg-[#fff] rounded-[8px] border-[1px] p-[6px] text-[0.75rem] font-[500] hover:bg-[#e3e3e3] mx-[20px]"
                value={searchTerm}
                onChange={handleInputChange}
              />
            )}

            {isLoading ? (
              <div className="p-[20px] flex justify-center items-center relative w-[100%] bg-[#fff]">
                <Spin className="absolute" />
              </div>
            ) : filteredOptions ? (
              filteredOptions.map((option, index) => (
                <div
                  className="py-[8px] border-b-[1px] px-[20px] hover:bg-[#e3e3e3]"
                  key={index}
                  onClick={() => handleSetSelected(option?.name, option?.id)}
                >
                  <p className="text-[0.75rem] font-[500]">{option?.name}</p>
                </div>
              ))
            ) : (
              options?.map((option, index) => (
                <div
                  key={index}
                  className="py-[8px] border-b-[1px] px-[20px] hover:bg-[#e3e3e3]"
                  onClick={() => handleSetSelected(option?.name, option?.id)}
                >
                  <p className="text-[0.75rem] font-[500] ">{option?.name}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectField;
