import { Spin } from "antd";
import React from "react";

function DataLoading() {
  return (
    <div className="p-[20px] flex justify-center items-center relative w-[100%] rounded-[8px]">
      <Spin className="absolute " size="large" />
    </div>
  );
}

export default DataLoading;
