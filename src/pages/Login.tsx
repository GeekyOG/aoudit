import React from "react";
import LoginForm from "../components/forms/LoginForm";

function Login() {
  return (
    <div className="flex justify-center mx-auto">
      <div className="mt-[50px]">
        <h1 className="text-[2.5rem] leading-[100%]">
          Continue from where you left off!
        </h1>
        <p className="mt-[12px]">
          Few steps a away from your business management.
        </p>

        <div className="mt-[20px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;
