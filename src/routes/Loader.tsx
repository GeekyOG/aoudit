import React from "react";

const Loader = () => (
  <div className="fixed top-0 left-0 z-50 w-full">
    <div className="mt-[200px]">
      <div className="h-full w-full" />
      <p className="text-center">Loading...</p>
    </div>
  </div>
);

export default Loader;
