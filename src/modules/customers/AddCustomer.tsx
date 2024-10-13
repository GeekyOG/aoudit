import { Drawer } from "antd";
import { Form, Formik } from "formik";
import React, { useEffect } from "react";
import Input from "../../components/input/Input";
import Button from "../../ui/Button";
import {
  useAddCustomerMutation,
  useLazyGetCustomerQuery,
  useLazyGetCustomersQuery,
  useUpdateCustomerMutation,
} from "../../api/customerApi";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  emailAddressValidation,
  phoneNumberValidation,
} from "../../constants/validationConstants";

const userValidation = Yup.object().shape({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  email: Yup.string(),
  phone: phoneNumberValidation,
});

interface AddCustomerProps {
  open: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  id?: string;
}

function AddCustomer({ open, setShowDrawer, id }: AddCustomerProps) {
  const onClose = () => {
    setShowDrawer(false);
  };

  const [addCustomer, { isLoading }] = useAddCustomerMutation();
  const [updateCustomer, { isLoading: updateLoading }] =
    useUpdateCustomerMutation();
  const [getCustomer, { data, isLoading: customerLoading }] =
    useLazyGetCustomerQuery();

  const [getCustomers, { isFetching, isError }] = useLazyGetCustomersQuery();

  useEffect(() => {
    if (id) {
      getCustomer(id);
    }
  }, [id]);

  return (
    <div>
      {open && (
        <Drawer title="Add Customer" onClose={onClose} open={open}>
          <div>
            <Formik
              initialValues={{
                firstName: data?.first_name ?? "",
                lastName: data?.last_name ?? "",
                email: data?.email ?? "",
                phone: data?.phone_number ?? "",
              }}
              validationSchema={userValidation}
              enableReinitialize={true}
              onSubmit={async (values, { resetForm }) => {
                try {
                  if (id) {
                    await updateCustomer({
                      first_name: values.firstName,
                      last_name: values.lastName,
                      email: values.email,
                      phone_number: values.phone,
                      id: id,
                    }).unwrap();
                  } else {
                    await addCustomer({
                      first_name: values.firstName,
                      last_name: values.lastName,
                      email: values.email,
                      phone_number: values.phone,
                    }).unwrap();
                  }

                  toast.success("Action Successful");
                  getCustomers("");
                } catch (err) {
                  toast.error(err.body.error ?? "Something went wrong");
                } finally {
                  resetForm();
                  setShowDrawer(false);
                }
              }}
            >
              {({ errors, touched, resetForm, values }) => {
                useEffect(() => {
                  values.firstName = data?.first_name ?? "";
                  values.lastName = data?.last_name ?? "";
                  values.email = data?.email ?? "";
                  values.phone = data?.phone_number ?? "";

                  if (!open) {
                    resetForm();
                  }
                }, [open, resetForm]);

                return (
                  <Form className="flex flex-col gap-[15px]">
                    <Input
                      title="First Name"
                      name="firstName"
                      placeholder="Enter your first name"
                      errors={errors.firstName}
                      touched={touched.firstName}
                    />
                    <Input
                      title="Last Name"
                      name="lastName"
                      placeholder="Enter your last name"
                      errors={errors.lastName}
                      touched={touched.lastName}
                    />
                    <Input
                      title="Email Address"
                      name="email"
                      placeholder="Enter your email address"
                      errors={errors.email}
                      touched={touched.email}
                    />
                    <Input
                      title="Phone Number"
                      name="phone"
                      placeholder="Enter your phone number"
                      errors={errors.phone}
                      touched={touched.phone}
                    />
                    <Button
                      className="h-[56px]"
                      isLoading={isLoading || updateLoading}
                    >
                      Submit
                    </Button>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </Drawer>
      )}
    </div>
  );
}

export default AddCustomer;
