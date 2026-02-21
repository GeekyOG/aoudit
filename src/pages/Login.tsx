import React from "react";
import LoginForm from "../components/forms/LoginForm";
import { Store } from "lucide-react";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Store size={13} className="text-white" />
            </div>
            <span className="font-semibold text-gray-800 text-sm">
              StoreManager
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Sign in to continue managing your business.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/"
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
