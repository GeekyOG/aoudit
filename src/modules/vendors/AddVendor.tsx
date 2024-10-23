import { Drawer } from "antd";
import { Form, Formik } from "formik";
import React, { useEffect } from "react";
import Input from "../../components/input/Input";
import Button from "../../ui/Button";
import {
  useAddSupplierMutation,
  useLazyGetSupplierQuery,
  useLazyGetSuppliersQuery,
  useUpdateSupplierMutation,
} from "../../api/vendorApi";
import { toast } from "react-toastify";

interface AddVendorProps {
  open: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  id?: string;
  callback?: () => void;
}

function AddVendor({ open, setShowDrawer, id, callback }: AddVendorProps) {
  const onClose = () => {
    setShowDrawer(false);
  };

  const [addSupplier, { isLoading }] = useAddSupplierMutation();
  const [updateSupplier, { isLoading: updateLoading }] =
    useUpdateSupplierMutation();
  const [getSupplier, { data, isLoading: SupplierLoading }] =
    useLazyGetSupplierQuery();

  const [getSuppliers] = useLazyGetSuppliersQuery();

  useEffect(() => {
    if (id) {
      getSupplier(id);
    }
  }, [id]);

  return (
    <Drawer title="Add Vendor" onClose={onClose} open={open}>
      <div>
        <Formik
          initialValues={{
            firstName: data?.first_name ?? "",
            lastName: data?.last_name ?? "",
            email: data?.email ?? "",
            phone: data?.phone_number ?? "",
          }}
          enableReinitialize={true}
          onSubmit={async (values, { resetForm }) => {
            try {
              if (id) {
                await updateSupplier({
                  first_name: values.firstName,
                  last_name: values.lastName,
                  email: values.email,
                  phone_number: values.phone,
                  id: id,
                })
                  .unwrap()
                  .then(() => {
                    getSupplier("");
                  });
              } else {
                await addSupplier({
                  first_name: values.firstName,
                  last_name: values.lastName,
                  email: values.email,
                  phone_number: values.phone,
                }).unwrap();
              }

              toast.success("Action Successful");
              getSuppliers("");
            } catch (err) {
              toast.error(err.body.error ?? "Something went wrong");
            } finally {
              // resetForm();
              setShowDrawer(false);
            }
          }}
        >
          {({ errors, touched, values, resetForm }) => {
            return (
              <Form className="flex flex-col gap-[15px]">
                <Input
                  title="Business Name"
                  name="firstName"
                  placeholder="Enter your first name"
                  errors={errors.firstName}
                  touched={touched.firstName}
                />
                <Input
                  title="Full Name"
                  name="lastName"
                  placeholder="Enter your first name"
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
                  placeholder="Enter your first name"
                  errors={errors.phone}
                  touched={touched.phone}
                />
                <Button
                  isLoading={isLoading || updateLoading}
                  className="h-[56px]"
                >
                  Submit
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Drawer>
  );
}

export default AddVendor;
