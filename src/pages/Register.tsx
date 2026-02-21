import React from "react";
import RegistrationForm from "../components/forms/RegistrationForm";
import { Store } from "lucide-react";
import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding */}

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px]">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Store size={13} className="text-white" />
            </div>
            <span className="font-semibold text-gray-800 text-sm">
              StoreManager
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">
            A few steps away from managing your business smarter.
          </p>

          <div className="mt-8">
            <RegistrationForm />
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
