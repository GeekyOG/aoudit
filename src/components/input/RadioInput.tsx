import clsx from "clsx";
import { FunctionComponent } from "react";

interface RadioInputProps {
  text: string;
  option: string;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFee?: React.Dispatch<React.SetStateAction<string>>;
  fee?: string;
}

const RadioInput: FunctionComponent<RadioInputProps> = ({
  text,
  option,
  selected,
  setSelected,
  setSelectedFee,
  fee,
}) => {
  const handleSelect = () => {
    if (setSelectedFee && fee) {
      setSelectedFee(fee);
    }
    setSelected(option);
  };
  return (
    <div
      className={clsx(
        "flex gap-[12px] cursor-pointer border-[1px] p-[8px] rounded-[4px]",
        option == selected
          ? "border-[#6178F3]"
          : "border-[6178F3] cursor-pointer"
      )}
      onClick={handleSelect}
    >
      {option == selected ? (
        <img src="/images/icons/selected.svg" alt="" />
      ) : (
        <img src="/images/icons/select.svg" alt="" />
      )}
      <p className="text-[0.813rem] font-[400] text-[#393941]">
        <span className="font-[600]">{option}</span> {text}
      </p>
    </div>
  );
};

export default RadioInput;
