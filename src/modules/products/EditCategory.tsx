import { Drawer } from "antd";
import { Form, Formik } from "formik";
import React from "react";
import Input from "../../components/input/Input";
import Button from "../../ui/Button";
import * as Yup from "yup";
import { nameValidation } from "../../constants/validationConstants";
import { useUpdateCategoryMutation } from "../../api/categoriesApi";
import { toast } from "react-toastify";

const categoryValidation = Yup.object({
  name: nameValidation,
});

interface EditCategoryProps {
  id: string;
  open: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

function EditCategory({ open, setShowDrawer, id }: EditCategoryProps) {
  const onClose = () => {
    setShowDrawer(false);
  };

  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  return (
    <Drawer title="Add Category" onClose={onClose} open={open}>
      <div>
        <Formik
          initialValues={{
            name: "",
          }}
          validationSchema={categoryValidation}
          onSubmit={(values, { resetForm }) => {
            updateCategory({ name: values.name })
              .unwrap()
              .then(() => {
                toast.success("Action successful");
                resetForm();
              })
              .catch((error) => {
                toast.error(error.data.error);
              });
          }}
        >
          {({ errors, touched }) => (
            <Form className="flex flex-col gap-[15px]">
              <Input
                title="Category Name"
                name="name"
                placeholder="Enter category name"
                errors={errors.name}
                touched={touched.name}
              />

              <Button className="h-[56px]" isLoading={isLoading}>
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Drawer>
  );
}

export default EditCategory;
