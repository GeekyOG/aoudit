import { Drawer } from "antd";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import Input from "../../components/input/Input";
import Button from "../../ui/Button";
import {
  useAddSubCategoryMutation,
  useLazyGetSubCategoriesQuery,
  useLazyGetSubCategoryQuery,
} from "../../api/subCategories";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { nameValidation } from "../../constants/validationConstants";
import SelectField from "../../components/input/SelectField";
import {
  useGetCategoriesQuery,
  useLazyGetCategoryQuery,
  useUpdateCategoryMutation,
} from "../../api/categoriesApi";

const categoryValidation = Yup.object({
  name: Yup.string().required(),
});

interface AddSubCategoryProps {
  open: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
  id?: string;
}

function AddSubCategory({ open, setShowDrawer, id }: AddSubCategoryProps) {
  const onClose = () => {
    setShowDrawer(false);
  };

  const { isFetching: categoryLoading, data: categoryData } =
    useGetCategoriesQuery("");

  const [selectedCategory, setSelectedCategory] = useState("Select an option");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryError, setSelectedCategoryError] = useState(false);

  const handleSelectFieldValidation = () => {
    if (selectedCategory === "Select an option") {
      setSelectedCategoryError(true);
    } else {
      setSelectedCategoryError(false);
    }
  };

  const [getSubCategory, { data, isSuccess }] = useLazyGetSubCategoryQuery();

  const [getSubCategories] = useLazyGetSubCategoriesQuery();

  const [updateCategory, { isLoading: updateLoading }] =
    useUpdateCategoryMutation();

  const [addSubCategory, { isLoading }] = useAddSubCategoryMutation();

  useEffect(() => {
    if (id) {
      getSubCategory(id);
    }
    if (isSuccess) {
      setSelectedCategory(
        categoryData.filter((item) => item.id === data.categoryId)[0].name
      );
      setSelectedCategoryId(data.categoryId);
    }
  }, [isSuccess]);

  return (
    <Drawer title="Add Size" onClose={onClose} open={open}>
      <div>
        <Formik
          initialValues={{
            categoryId: data?.categoryId ?? "",
            name: data?.name ?? "",
          }}
          enableReinitialize={true}
          validationSchema={categoryValidation}
          onSubmit={async (values, { resetForm }) => {
            try {
              if (id) {
                await updateCategory({
                  categoryId: selectedCategoryId,
                  name: values.name,
                  id,
                })
                  .unwrap()
                  .then(() => {
                    toast.success("Action successful");
                    setSelectedCategory("");
                    setSelectedCategoryId("");
                    getSubCategories("");
                  });
              } else {
                await addSubCategory({
                  categoryId: selectedCategoryId,
                  name: values.name,
                })
                  .unwrap()
                  .then(() => {
                    toast.success("Action successful");
                    setSelectedCategory("");
                    setSelectedCategoryId("");

                    if (getSubCategories) {
                      getSubCategories("");
                    }
                  });
              }
            } catch (error) {
              toast.error(error.data.error);
            } finally {
              resetForm();
              onClose();
            }
          }}
        >
          {({ errors, touched }) => (
            <Form className="flex flex-col gap-[15px]">
              <SelectField
                error={false}
                isLoading={categoryLoading}
                selected={selectedCategory}
                setId={setSelectedCategoryId}
                setSelected={setSelectedCategory}
                title="Color"
                className="mt-[18px]"
                width="w-[100%]"
                options={categoryData?.map((option) => ({
                  id: option.id,
                  name: option.name,
                }))}
              />
              <Input
                title="Sub Size"
                name="name"
                placeholder="Enter size"
                errors={errors.name}
                touched={touched.name}
              />

              <Button
                isLoading={isLoading || updateLoading}
                className="h-[56px]"
              >
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Drawer>
  );
}

export default AddSubCategory;
