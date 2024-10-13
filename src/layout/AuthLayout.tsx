import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function AuthLayout() {
  return (
    <div className="min-h-[100vh] w-[100%] bg-[url('/grid-layer.png')] pb-[100px]">
      <Header />
      <div className="mx-auto max-w-[500px]">
        <Outlet />
      </div>
      <ToastContainer />
    </div>
  );
}

export default AuthLayout;
