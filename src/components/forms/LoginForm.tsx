import React from "react";
import { Form, Formik } from "formik";
import Input from "../input/Input";
import Button from "../../ui/Button";
import * as Yup from "yup";
import { emailAddressValidation } from "../../constants/validationConstants";
import { useLoginUserMutation } from "../../api/authApi";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const loginValidation = Yup.object().shape({
  email: emailAddressValidation,
  password: Yup.string().required("Password is required"),
});

function LoginForm() {
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginValidation}
      onSubmit={(values) => {
        loginUser(values)
          .unwrap()
          .then((response) => {
            toast.success("Logged in successfully");
            localStorage.setItem(
              "permissions",
              JSON.stringify(response.role.Permissions),
            );
            localStorage.setItem("user", JSON.stringify(response.user));
            Cookies.set("authToken", response.token, {
              sameSite: "Strict",
              secure: true,
            });
            setTimeout(() => navigate("/dashboard"), 1000);
          })
          .catch((error) => {
            toast.error(error.data.message ?? "Something went wrong.");
          });
      }}
    >
      {({ errors, touched }) => (
        <Form className="flex flex-col gap-4">
          <Input
            title="Email Address"
            errors={errors.email}
            name="email"
            touched={touched.email}
            placeholder="you@example.com"
          />

          <Input
            title="Password"
            errors={errors.password}
            name="password"
            touched={touched.password}
            placeholder="Enter your password"
            type="password"
          />

          <Button
            isLoading={isLoading}
            className="mt-2 h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold transition-colors"
          >
            Sign In
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default LoginForm;
