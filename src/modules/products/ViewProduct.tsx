import React, { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import { IoIosAdd, IoMdRemove } from "react-icons/io";
import Input from "../../components/input/Input";
import SelectField from "../../components/input/SelectField";
import Button from "../../ui/Button";
import Container from "../../ui/Container";
import AddCategory from "./AddCategoryDrawer";
import AddSubCategory from "./AddSubCategory";
import AddVendor from "../vendors/AddVendor";
import { useLazyGetCategoriesQuery } from "../../api/categoriesApi";
import { useLazyGetSubCategoriesQuery } from "../../api/subCategories";
import { useGetSupplierQuery } from "../../api/vendorApi";
import {
  useAddProductMutation,
  useGetProductQuery,
  useLazyGetProductQuery,
  useLazyGetProductsQuery,
  useUpdateProductMutation,
} from "../../api/productApi";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { nameValidation } from "../../constants/validationConstants";

function ViewProduct({
  id,
  setShowAddProduct,
}: {
  id: string;
  setShowAddProduct: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [inputFields, setInputFields] = useState<
    { value: string; index: number; fetched: boolean }[]
  >([{ value: "", index: 1, fetched: true }]);

  const [selectedCategory, setSelectedCategory] = useState("Select an option");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryError, setSelectedCategoryError] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState("Select an option");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedVendorError, setSelectedVendorError] = useState(false);

  const [selectedSubCategory, setSelectedSubCategory] =
    useState("Select an option");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedSubCategoryError, setSelectedSubCategoryError] =
    useState(false);

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      { value: "", index: inputFields.length + 1, fetched: false },
    ]);
  };

  const [getCategories, { isFetching: categoryLoading, data: categoryData }] =
    useLazyGetCategoriesQuery();

  const { isFetching: supplierLoading, data: supplierData } =
    useGetSupplierQuery("");

  const [updateProduct, { isLoading: addProductLoading }] =
    useUpdateProductMutation();

  const [
    getSubCategories,
    { isFetching: subCategoryLoading, data: subCategoryData },
  ] = useLazyGetSubCategoriesQuery();

  const handleRemoveField = (index: number) => {
    setInputFields(
      inputFields?.filter((item) => inputFields.indexOf(item) !== index)
    );
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputFields = [...inputFields];
    newInputFields[index].value = value;
    setInputFields(newInputFields);
  };

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);

  useEffect(() => {
    getCategories("");
  }, [isCategoryOpen]);

  useEffect(() => {
    getSubCategories("");
  }, [isSubCategoryOpen]);

  const handleSelectFieldValidation = () => {
    if (selectedCategory === "Select an option") {
      setSelectedCategoryError(true);
    } else {
      setSelectedCategoryError(false);
    }
    if (selectedSubCategory === "Select an option") {
      setSelectedSubCategoryError(true);
    } else {
      setSelectedSubCategoryError(false);
    }
    if (selectedVendor === "Select an option") {
      setSelectedVendorError(true);
    } else {
      setSelectedVendorError(false);
    }
  };
  const [getProducts, { isFetching: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  const [getProduct, { isLoading, data }] = useLazyGetProductQuery();

  useEffect(() => {
    getProduct(id ?? "");
  }, []);

  useEffect(() => {
    if (data) {
      const updatedInputFields = JSON.parse(data.serial_numbers)?.map(
        (code, index) => {
          return {
            value: code,
            index: index + 1,
            fetched: true,
          };
        }
      );

      setInputFields(updatedInputFields);
      setSelectedCategory(data.Category.name);
      setSelectedCategoryId(data.categoryId);
      setSelectedSubCategory(data.Subcategory.name);
      setSelectedSubCategoryId(data.subCategoryId);
      setSelectedVendor(
        `${data?.Vendor?.first_name} ${data?.Vendor?.last_name}`
      );
      setSelectedVendorId(data.Vendor?.id);
    }
  }, [data]);

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[100] flex w-[100vw] justify-center bg-[#000000a3] px-3">
      <Container className="no-scrollbar mt-[30px] h-[calc(100vh-50px)] max-w-[100vw] overflow-y-scroll rounded-md bg-[#fff] p-[50px] lg:max-w-[1000px] lg:px-[100px]">
        <div className="flex items-center justify-between">
          <p className="text-[1.5rem] font-[500]">Edit Product</p>

          <p
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[50px] bg-[#e3e3e3] p-3 font-semibold"
            onClick={() => setShowAddProduct(false)}
          >
            X
          </p>
        </div>
        <div>
          <Formik
            initialValues={{
              name: data?.product_name ?? "",
              quantity: data
                ? (JSON.parse(data?.serial_numbers).length ?? "")
                : "",
              purchasePrice: data?.purchase_amount ?? "",
              salesPrice: data?.sales_price ?? "",
            }}
            enableReinitialize={true}
            onSubmit={(values) => {
              updateProduct({
                body: {
                  product_name: values.name,
                  price: parseFloat(values.salesPrice),
                  quantity: parseInt(values.quantity),
                  purchase_amount: parseFloat(values.purchasePrice),
                  sales_price: parseFloat(values.salesPrice),
                  subcategoryId: selectedSubCategoryId,
                  categoryId: selectedCategoryId,
                  vendorId: selectedVendorId,
                  serial_numbers: inputFields?.map((value) => value.value),
                },
                id: id,
              })
                .unwrap()
                .then(() => {
                  getProduct(id ?? "");
                  getProducts("");
                  toast.success("Product updated successfully");
                  setShowAddProduct(false);
                })
                .catch((error) => {
                  toast.error(error.data.error ?? "Something went wrong.");
                });
            }}
          >
            {({ touched, errors, values }) => {
              return (
                <Form>
                  <div className="mt-[50px] flex w-[100%] flex-col gap-3 lg:flex-row">
                    <div className="w-[100%]">
                      <Input
                        title="Product Name"
                        name="name"
                        placeholder="Enter Item Name"
                        width="max-h-[40px] w-[100%]"
                        errors={errors.name}
                        touched={touched.name}
                      />
                    </div>
                    <div className=" w-[100%]">
                      <SelectField
                        searchPlaceholder="Enter category name"
                        className="w-[100%]"
                        title="Category"
                        error={selectedCategoryError}
                        selected={selectedCategory}
                        setId={setSelectedCategoryId}
                        setSelected={setSelectedCategory}
                        isLoading={categoryLoading}
                        options={categoryData || []}
                      />
                      <div
                        className="flex  cursor-pointer items-center text-[blue]"
                        onClick={() => setIsCategoryOpen(true)}
                      >
                        <p className="text-[0.75rem] font-[400]">
                          Add Category
                        </p>
                        <IoIosAdd className="cursor-pointer text-[0.865rem]" />
                      </div>
                    </div>
                    <div className=" w-[100%]">
                      <SelectField
                        searchPlaceholder="Enter sub category name"
                        className="w-[100%]"
                        title="Sub Category"
                        error={selectedSubCategoryError}
                        selected={selectedSubCategory}
                        setId={setSelectedSubCategoryId}
                        setSelected={setSelectedSubCategory}
                        isLoading={subCategoryLoading}
                        options={
                          (selectedCategoryId &&
                            subCategoryData?.filter(
                              (item) => item.categoryId == selectedCategoryId
                            )) ||
                          []
                        }
                      />
                      <div
                        className="flex cursor-pointer items-center text-[blue]"
                        onClick={() => setIsSubCategoryOpen(true)}
                      >
                        <p className="text-[0.75rem] font-[400]">
                          Add Sub Category
                        </p>
                        <IoIosAdd className="text-[0.865rem] " />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex w-[100%] gap-3">
                    <div className=" w-[100%]">
                      <Input
                        name="quantity"
                        type="number"
                        title="Quantity"
                        placeholder="0"
                        errors={errors.quantity}
                        touched={touched.quantity}
                        width="max-h-[40px] w-[100%]"
                      />
                    </div>
                    <div className=" w-[100%]">
                      <Input
                        name="purchasePrice"
                        type="number"
                        title="Purchase Price"
                        placeholder="0"
                        errors={errors.purchasePrice}
                        touched={touched.purchasePrice}
                        width="max-h-[40px] w-[100%]"
                      />
                    </div>

                    <div className=" w-[100%]">
                      <Input
                        name="salesPrice"
                        type="number"
                        title="Sales Price"
                        placeholder="0"
                        errors={errors.salesPrice}
                        touched={touched.salesPrice}
                        width="max-h-[40px] w-[100%]"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className=" w-[100%]">
                      <SelectField
                        searchPlaceholder="Enter sub category name"
                        className="w-[100%]"
                        title="Vendor"
                        error={selectedVendorError}
                        selected={selectedVendor}
                        setId={setSelectedVendorId}
                        setSelected={setSelectedVendor}
                        isLoading={supplierLoading}
                        options={
                          supplierData?.map((item) => {
                            return {
                              name: `${item.firstName} ${item.lastName}`,
                              id: item.id,
                            };
                          }) || []
                        }
                      />
                      <div
                        className="flex cursor-pointer items-center text-[blue]"
                        onClick={() => setIsVendorOpen(true)}
                      >
                        <p className="text-[0.75rem] font-[400]">Add Vendor</p>
                        <IoIosAdd className="text-[0.865rem] " />
                      </div>
                    </div>
                  </div>

                  <hr className="my-5" />
                  <div className="flex flex-col gap-[5] ">
                    <p className="font-[500]">Enter Serial Number(s)</p>
                    {inputFields.map((inputValue, index) => (
                      <div
                        key={index}
                        className="mt-5 flex w-[100%] items-center gap-[40px]"
                      >
                        <div className="w-[100%]">
                          <input
                            onChange={(e) =>
                              handleInputChange(index, e.target.value)
                            }
                            required
                            value={inputValue.value}
                            // Set the value from the inputFields state
                            title="Serial Number"
                            placeholder="DFGHJ$%^&"
                            className="max-h-[40px] w-[100%] rounded-[8px] border-[1px] px-[5px] py-[12px] text-[0.865rem] lg:max-w-[330px]"
                          />
                        </div>

                        <div className="rounded-[50%] bg-[#000] p-1">
                          {index == inputFields.length - 1 ? (
                            <IoIosAdd
                              onClick={() =>
                                inputFields.length < parseInt(values.quantity)
                                  ? handleAddField()
                                  : null
                              }
                              size={26}
                              className="cursor-pointer text-[#fff]"
                            />
                          ) : (
                            <IoMdRemove
                              onClick={() => handleRemoveField(index)}
                              size={26}
                              className="cursor-pointer text-[#fff]"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="mt-5"
                    isLoading={addProductLoading}
                    onClick={handleSelectFieldValidation}
                  >
                    <p>Continue</p>
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </div>
        <AddCategory open={isCategoryOpen} setShowDrawer={setIsCategoryOpen} />
        <AddSubCategory
          open={isSubCategoryOpen}
          setShowDrawer={setIsSubCategoryOpen}
        />
        <AddVendor open={isVendorOpen} setShowDrawer={setIsVendorOpen} />
      </Container>
    </div>
  );
}

export default ViewProduct;
