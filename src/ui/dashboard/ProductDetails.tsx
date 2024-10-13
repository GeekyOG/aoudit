import React from "react";

interface ProductDetailsProps {
  title: string;
  text: string;
}
function ProductDetails({ title, text }: ProductDetailsProps) {
  return (
    <div className="flex text-[0.865rem] gap-[16px]">
      <p className="text-neutral-400 font-[600] w-[120px]">{title}:</p>
      <p>{text}</p>
    </div>
  );
}

export default ProductDetails;
