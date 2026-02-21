import React from "react";
import { Form, Formik } from "formik";
import Input from "../input/Input";
import Button from "../../ui/Button";
import * as Yup from "yup";
import { useRegisterUserMutation } from "../../api/authApi";
import { toast } from "react-toastify";
import {
  firstNameValidation,
  lastNameValidation,
  emailAddressValidation,
  phoneNumberValidation,
} from "../../constants/validationConstants";
import { useNavigate } from "react-router-dom";

const RegistrationValidation = Yup.object().shape({
  firstname: firstNameValidation,
  lastname: lastNameValidation,
  email: emailAddressValidation,
  phone_number: phoneNumberValidation,
  business_name: Yup.string().required("Business name is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

function RegistrationForm() {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  return (
    <Formik
      initialValues={{
        firstname: "",
        lastname: "",
        email: "",
        phone_number: "",
        business_name: "",
        password: "",
        confirmPassword: "",
        roleId: 1,
      }}
      validationSchema={RegistrationValidation}
      onSubmit={async (values) => {
        registerUser(values)
          .unwrap()
          .then(() => {
            toast.success("Registration successful");
            setTimeout(() => navigate("/login"), 1000);
          })
          .catch((err) => {
            toast.error(
              err.data.error ?? "Something went wrong, please try again",
            );
          });
      }}
    >
      {({ errors, touched }) => (
        <Form className="flex flex-col gap-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              title="First Name"
              errors={errors.firstname}
              name="firstname"
              touched={touched.firstname}
              placeholder="First name"
            />
            <Input
              title="Last Name"
              errors={errors.lastname}
              name="lastname"
              touched={touched.lastname}
              placeholder="Last name"
            />
          </div>

          <Input
            title="Business Name"
            errors={errors.business_name}
            name="business_name"
            touched={touched.business_name}
            placeholder="Your business name"
          />

          <Input
            title="Email Address"
            errors={errors.email}
            name="email"
            touched={touched.email}
            placeholder="you@example.com"
          />

          <Input
            title="Phone Number"
            type="tel"
            errors={errors.phone_number}
            name="phone_number"
            touched={touched.phone_number}
            placeholder="+234 000 000 0000"
          />

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">Security</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <Input
            title="Password"
            errors={errors.password}
            name="password"
            touched={touched.password}
            placeholder="Min. 8 characters"
            type="password"
          />

          <Input
            title="Confirm Password"
            errors={errors.confirmPassword}
            name="confirmPassword"
            touched={touched.confirmPassword}
            placeholder="Repeat your password"
            type="password"
          />

          <Button
            className="mt-2 h-11 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold transition-colors"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default RegistrationForm;
