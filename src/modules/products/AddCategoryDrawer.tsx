import { Drawer } from "antd";
import { Form, Formik } from "formik";
import React, { useEffect } from "react";
import Input from "../../components/input/Input";
import Button from "../../ui/Button";
import * as Yup from "yup";
import { nameValidation } from "../../constants/validationConstants";
import {
  useAddCategoryMutation,
  useLazyGetCategoriesQuery,
  useLazyGetCategoryQuery,
  useUpdateCategoryMutation,
} from "../../api/categoriesApi";
import { toast } from "react-toastify";

const categoryValidation = Yup.object({
  name: nameValidation,
});

interface AddCategoryProps {
  open: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  callBackAction?: any;
  id?: string;
}

function AddCategory({ open, setShowDrawer, id }: AddCategoryProps) {
  const onClose = () => {
    setShowDrawer(false);
  };

  const [addCategory, { isLoading }] = useAddCategoryMutation();

  const [getCategory, { data, isFetching, isError }] =
    useLazyGetCategoryQuery();
  const [updateCategory, { isLoading: updateLoading }] =
    useUpdateCategoryMutation();
  useEffect(() => {
    if (id) {
      getCategory(id);
    }
  }, []);

  const [getCategories] = useLazyGetCategoriesQuery();

  return (
    <Drawer title="Add Color" onClose={onClose} open={open}>
      {!isFetching && (
        <div>
          <Formik
            initialValues={{
              name: data?.name ?? "",
            }}
            validationSchema={categoryValidation}
            enableReinitialize={true}
            onSubmit={async (values, { resetForm }) => {
              try {
                if (id) {
                  updateCategory({ name: values.name, imageUrl: "string", id })
                    .unwrap()
                    .then(() => {
                      toast.success("Action successful");
                      getCategories("");
                      onClose();
                    });
                } else {
                  addCategory({ name: values.name, imageUrl: "string" })
                    .unwrap()
                    .then(() => {
                      toast.success("Action successful");
                      if (getCategories) {
                        getCategories("");
                      }
                      onClose();
                    });
                }
              } catch (error) {
                toast.error(error.data.message);
              } finally {
                // setShowDrawer(false);
              }
            }}
          >
            {({ errors, touched, resetForm, values }) => {
              useEffect(() => {
                values.name = data?.name ?? "";

                if (!open) {
                  resetForm();
                }
              }, [open, resetForm]);

              return (
                <Form className="flex flex-col gap-[15px]">
                  <Input
                    title="Color"
                    name="name"
                    placeholder="Enter color"
                    errors={errors.name}
                    touched={touched.name}
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
      )}
    </Drawer>
  );
}

export default AddCategory;
