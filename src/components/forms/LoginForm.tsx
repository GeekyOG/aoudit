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
      initialValues={{
        email: "",
        password: "",
      }}
      validationSchema={loginValidation}
      onSubmit={(values) => {
        loginUser(values)
          .unwrap()
          .then((response) => {
            toast.success("Logged in successful");

            const accessToken = response.token;

            localStorage.setItem(
              "permissions",
              JSON.stringify(response.role.Permissions)
            );

            localStorage.setItem("user", JSON.stringify(response.user));

            Cookies.set("authToken", accessToken, {
              sameSite: "Strict",
              secure: true,
            });

            setTimeout(() => {
              navigate("/dashboard");
            }, 1000);
          })
          .catch((error) => {
            toast.error(error.data.message ?? "Something went wrong.");
          });
      }}
    >
      {({ errors, touched }) => (
        <Form className="flex flex-col gap-[8px]">
          <Input
            title="Email"
            errors={errors.email}
            name="email"
            touched={touched.email}
            placeholder="Enter your email address"
          />

          <Input
            title="Password"
            errors={errors.password}
            name="password"
            touched={touched.password}
            placeholder="Enter your password"
            type="password"
          />

          <Button isLoading={isLoading} className="mt-[15px] h-[56px] w-[100%]">
            <p>Submit</p>
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default LoginForm;
