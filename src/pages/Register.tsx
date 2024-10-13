import React from "react";
import RegistrationForm from "../components/forms/RegistrationForm";

function Register() {
  return (
    <div className="flex justify-center mx-auto">
      <div className="mt-[50px]">
        <h1 className="text-[3rem]">Let’s get you Started!</h1>
        <p>Few steps a away from your business management.</p>

        <div className="mt-[20px]">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}

export default Register;
