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
  business_name: Yup.string().required(),
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
        roleId: 1,
        confirmPassword: "",
      }}
      validationSchema={RegistrationValidation}
      onSubmit={async (values) => {
        registerUser(values)
          .unwrap()
          .then(() => {
            toast.success("Registration successful");
            setTimeout(() => {
              navigate("/login");
            }, 1000);
          })
          .catch((err) => {
            toast.error(err.data.error ?? "something wrong try again");
          });
      }}
    >
      {({ errors, touched }) => (
        <Form className="flex flex-col gap-[8px]">
          <Input
            title="First Name"
            errors={errors.firstname}
            name="firstname"
            touched={touched.firstname}
            placeholder="Enter your first name"
          />

          <Input
            title="Last Name"
            errors={errors.lastname}
            name="lastname"
            touched={touched.lastname}
            placeholder="Enter your Last name"
          />
          <Input
            title="Email"
            errors={errors.email}
            name="email"
            touched={touched.email}
            placeholder="Enter your email address"
          />
          <Input
            title="Phone Number"
            type="tel"
            errors={errors.phone_number}
            name="phone_number"
            touched={touched.phone_number}
            placeholder="Enter your phone number"
          />
          <Input
            title="Business Name"
            errors={errors.business_name}
            name="business_name"
            touched={touched.business_name}
            placeholder="Enter your Business Name"
          />

          <Input
            title="Password"
            errors={errors.password}
            name="password"
            touched={touched.password}
            placeholder="Enter your password"
            type="password"
          />
          <Input
            title="Confirm Password"
            errors={errors.confirmPassword}
            name="confirmPassword"
            touched={touched.confirmPassword}
            placeholder="Confirm your password"
            type="password"
          />

          <Button className="mt-[15px] h-[56px] w-[100%]" isLoading={isLoading}>
            <p>Submit</p>
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default RegistrationForm;
