import { Drawer } from "antd";
import { Field, Form, Formik } from "formik";
import React, { useEffect } from "react";
import Input from "../../components/input/Input";
import Button from "../../ui/Button";
import { useLazyGetRolesQuery } from "../../api/rolesApi";
import {
  useAddAdminUserMutation,
  useLazyGetAdminUserQuery,
} from "../../api/adminUsers";
import { toast } from "react-toastify";

interface AddUserProps {
  id?: string;
  open: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

function AddUser({ open, setShowDrawer, id }: AddUserProps) {
  const [getRoles, { data: roles, isFetching, isError }] =
    useLazyGetRolesQuery();

  const [getAminUsers] = useLazyGetAdminUserQuery();

  const [addAdminUser, { isLoading }] = useAddAdminUserMutation();

  useEffect(() => {
    getRoles("");
  }, []);

  const [getAdminUser, { data: userData }] = useLazyGetAdminUserQuery();

  useEffect(() => {
    if (id) {
      getAdminUser(id);
    }
  }, []);

  const onClose = () => {
    setShowDrawer(false);
  };

  return (
    <Drawer title="Add User" onClose={onClose} open={open}>
      <div>
        <Formik
          initialValues={{
            firstname: userData?.firstname ?? "",
            lastname: userData?.lastname ?? "",
            email: userData?.email ?? "",
            phone_number: userData?.phone_number ?? "",
            roleId: userData?.Role.id ?? "",
            password: "",
          }}
          enableReinitialize={true}
          onSubmit={(values) => {
            addAdminUser(values)
              .unwrap()
              .then(() => {
                toast.success("Action successful");
                getAminUsers("");
                onClose();
              })
              .catch((error) => {
                toast.error(error.data.error);
              });
          }}
        >
          {({ errors, touched }) => (
            <Form className="flex flex-col gap-[15px]">
              <Input
                title="First Name"
                name="firstname"
                placeholder="Enter your first name"
                errors={errors.firstname}
                touched={touched.firstname}
              />
              <Input
                title="Last Name"
                name="lastname"
                placeholder="Enter your first name"
                errors={errors.lastname}
                touched={touched.lastname}
              />
              <Input
                title="Email Address"
                name="email"
                placeholder="Enter your first name"
                errors={errors.email}
                touched={touched.email}
              />

              <div>
                <label
                  htmlFor={`roleId`}
                  className="text-[0.865rem] font-[600]"
                >
                  Role
                </label>
                <Field
                  className="border-[1px] rounded-[6px] py-4 text-[0.75rem] outline-none px-2 w-[100%]"
                  as="select"
                  name={`roleId`}
                >
                  <option value="">Select an option</option>
                  {roles?.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Field>
              </div>
              <Input
                title="Phone Number"
                name="phone_number"
                placeholder="Enter your phone number"
                errors={errors.phone_number}
                touched={touched.phone_number}
              />
              <Input
                title="Password"
                errors={errors.password}
                name="password"
                touched={touched.password}
                placeholder="Enter your password"
                type="password"
              />
              <Button isLoading={isLoading} className="h-[56px]">
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Drawer>
  );
}

export default AddUser;
