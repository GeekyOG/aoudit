import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
  FormikErrors,
} from "formik";
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
import { useLazyGetSupplierQuery } from "../../api/vendorApi";
import {
  useAddProductMutation,
  useLazyGetProductsQuery,
} from "../../api/productApi";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { cn } from "../../utils/cn";
import { useLazyGetOrdersQuery } from "../../api/ordersApi";
import DataLoading from "../../ui/DataLoading";
const addProductValidation = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  quantity: Yup.number()
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
  salesPrice: Yup.number()
    // .required("Sales price is required")
    .min(100, "Sales price must be at least 100"),
  purchasePrice: Yup.number()
    .required("Purchase price is required")
    .min(100, "Purchase price must be at least 100"),

  items: Yup.array()
    .of(
      Yup.object().shape({
        sn: Yup.string()
          .required("SN is required")
          .min(5, "SN must be at least 5 characters"),
      })
    )
    .min(1, "At least one item is required"),
});

function AddProductModal({
  setShowAddProduct,
}: {
  setShowAddProduct: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [inputFields, setInputFields] = useState<
    { value: string; index: number }[]
  >([{ value: "", index: 1 }]);

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

  const [getProducts] = useLazyGetProductsQuery();

  useEffect(() => {
    getProducts("");
  }, []);
  const [getCategories, { isFetching: categoryLoading, data: categoryData }] =
    useLazyGetCategoriesQuery();

  const [getSupplier, { isFetching: supplierLoading, data: supplierData }] =
    useLazyGetSupplierQuery();

  useEffect(() => {
    getSupplier("");
  }, [getSupplier]);

  const [addProduct, { isLoading: addProductLoading }] =
    useAddProductMutation();

  const [
    getSubCategories,
    { isFetching: subCategoryLoading, data: subCategoryData },
  ] = useLazyGetSubCategoriesQuery();

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

  const [searchValue, setSearchValue] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const [
    getOrders,
    { data: ordersData, isError, isSuccess, isLoading: ordersLoading },
  ] = useLazyGetOrdersQuery();

  const [getProduct, { isLoading: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  useEffect(() => {
    getOrders("");
    getProduct("");
  }, [getProduct, getOrders]);

  const result: { productName: any }[] = Array.from(
    new Set(productsData?.map((product) => product.product_name))
  ).map((productName) => ({
    productName,
  }));

  const optionsRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (result) {
      return result.filter((item) =>
        item.productName.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    return [];
  }, [result, searchValue]);

  const uniqueSN = (
    data: {
      sn: string;
    }[],
    setErrors: (
      errors: FormikErrors<{
        items: { sn: string }[];
      }>
    ) => void,

    salesResult: { serial_number: string; productId: string }[], // New: salesResult
    productResult: { serial_number: string; productId: string }[] // New: productResult
  ) => {
    const duplicates = data.filter((item, index, self) =>
      self.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && item.sn === otherItem.sn
      )
    );

    // Check if SN exists in salesResult or productResult
    const snExistsInOtherSources = data.filter((item) =>
      [...salesResult, ...productResult].some(
        (existingItem) => existingItem.serial_number === item.sn
      )
    );

    const errors: FormikErrors<{
      items: { sn: string }[];
    }> = { items: [] };

    if (duplicates.length > 0) {
      toast.error("Multiple items with duplicate SNs found");

      // Set errors for duplicate serial numbers
      data.forEach((item, index) => {
        const hasDuplicate = duplicates.some(
          (duplicateItem) => duplicateItem.sn === item.sn
        );

        if (hasDuplicate) {
          if (!errors.items) errors.items = [];
          errors.items[index] = {
            sn: "Exists in multiple items",
          };
        }
      });
    }

    if (snExistsInOtherSources.length > 0) {
      toast.error("Some serial numbers already exist in the system");

      // Set errors for serial numbers already in salesResult or productResult
      data.forEach((item, index) => {
        const existsInSources = snExistsInOtherSources.some(
          (sourceItem) => sourceItem.sn === item.sn
        );

        if (existsInSources) {
          if (!errors.items) errors.items = [];
          errors.items[index] = {
            sn: "This serial number already exists in the system",
          };
        }
      });
    }

    if (duplicates.length > 0 || snExistsInOtherSources.length > 0) {
      setErrors(errors);
      return false;
    }

    return true;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-10 flex w-[100vw] justify-center bg-[#000000a3] px-3">
      {/* {!ordersLoading && !productsLoading && (
        <div>
          <DataLoading />
        </div>
      )} */}

      {ordersData && productsData && (
        <Container className="no-scrollbar mt-[30px] h-[calc(100vh-50px)] max-w-[100vw] overflow-y-scroll rounded-md bg-[#fff] p-[50px] lg:max-w-[1000px] lg:px-[100px]">
          <div className="flex items-center justify-between">
            <p className="text-[1.5rem] font-[500]">Add New Product</p>

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
                name: "",
                quantity: "",
                purchasePrice: "",
                salesPrice: "",
                items: [{ sn: "" }],
              }}
              validationSchema={addProductValidation}
              onSubmit={(values, { resetForm, setErrors }) => {
                const salesResult = ordersData?.map((order) => ({
                  serial_number: order.serial_number,
                  productId: order.productId,
                }));

                const productResult = productsData?.flatMap((product) =>
                  JSON.parse(product.serial_numbers).map((serial_number) => ({
                    serial_number,
                    productId: product.id,
                  }))
                );

                const uniqueSn = uniqueSN(
                  values.items,
                  setErrors,
                  salesResult, // Pass sales data
                  productResult // Pass product data
                );
                if (
                  !selectedCategoryError ||
                  !selectedSubCategoryError ||
                  !selectedVendorError
                ) {
                  if (
                    values.items.length == parseInt(values.quantity) &&
                    uniqueSn
                  ) {
                    addProduct({
                      product_name: searchValue,
                      price: parseFloat(values.salesPrice),
                      quantity: parseInt(values.quantity),
                      purchase_amount: parseFloat(values.purchasePrice),
                      sales_price: parseFloat(values.salesPrice),
                      subcategoryId: selectedSubCategoryId,
                      categoryId: selectedCategoryId,
                      vendorId: selectedVendorId,
                      serial_numbers: values.items?.map((value) => value.sn),
                    })
                      .unwrap()
                      .then(() => {
                        toast.success("Product added successfully");
                        getProducts("");
                        setShowAddProduct(false);
                      })
                      .catch((error) => {
                        toast.error(
                          error.data.error ?? "Something went wrong."
                        );
                      });
                  }
                }
              }}
            >
              {({ touched, errors, values, setFieldValue }) => (
                <Form>
                  <div className="mt-[50px] flex w-[100%] flex-col gap-3 lg:flex-row">
                    <div className="w-[100%] relative">
                      <label
                        htmlFor={`name`}
                        className={cn(
                          "text-[0.865rem] font-[600]",
                          errors.name && "text-[red]"
                        )}
                      >
                        Product Name
                      </label>
                      <Field
                        className={cn(
                          "border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2",
                          errors.name && "border-[red]"
                        )}
                        name={`name`}
                        type=""
                        value={searchValue}
                        onChange={(e) => {
                          setShowSuggestion(true);
                          setSearchValue(e.target.value);
                          setFieldValue("name", e.target.value);
                        }}
                      />
                      <ErrorMessage
                        name={`name`}
                        component="div"
                        className="text-[12px] font-[400] text-[#f00000]"
                      />
                      {/* <Input
                      title="Product Name"
                      errors={errors.name}
                      touched={touched.name}
                      name="name"
                      placeholder="Enter Item Name"
                      width="max-h-[40px] w-[100%]"
                    /> */}

                      {filteredOptions && showSuggestion && (
                        <div
                          className="bg-[#fff] shadow-lg p-[14px] absolute w-[100%] z-[10]"
                          ref={optionsRef}
                        >
                          {filteredOptions?.map((value, index) => (
                            <div
                              className="border-b-[1px] py-[8px] cursor-pointer"
                              key={index}
                              onClick={() => {
                                setSearchValue(value.productName);
                                setShowSuggestion(false);
                              }}
                            >
                              <p>{value.productName}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className=" w-[100%]">
                      <SelectField
                        searchPlaceholder="Enter Color"
                        className="w-[100%]"
                        title="Color"
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
                        <p className="text-[0.75rem] font-[400]">Add Color</p>
                        <IoIosAdd className="cursor-pointer text-[0.865rem]" />
                      </div>
                    </div>
                    <div className=" w-[100%]">
                      <SelectField
                        searchPlaceholder="Enter sub category name"
                        className="w-[100%]"
                        title="Size"
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
                        <p className="text-[0.75rem] font-[400]">Add Size</p>
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
                              name: `${item.first_name}`,
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
                    <FieldArray name="items">
                      {({ remove, push }) => (
                        <div>
                          {values.items.length > 0 &&
                            values.items.map((item, index) => (
                              <div
                                key={index}
                                className="mt-5 flex w-[100%] items-center gap-[40px]"
                              >
                                <div className="w-[100%]">
                                  <Field
                                    as=""
                                    name={`items[${index}].sn`}
                                    className="max-h-[40px] w-[100%] rounded-[8px] border-[1px] px-[5px] py-[12px] text-[0.865rem] lg:max-w-[330px]"
                                    placeholder="Enter Serial Number"
                                  />

                                  <ErrorMessage
                                    name={`items[${index}].sn`}
                                    component="div"
                                    className="text-[12px] font-[400] text-[#f00000]"
                                  />
                                </div>

                                <div className="rounded-[50%] bg-[#000] p-1">
                                  {index == values.items.length - 1 ? (
                                    <IoIosAdd
                                      onClick={() => {
                                        if (
                                          values.items.length <
                                          parseInt(values.quantity)
                                        ) {
                                          push({
                                            sn: "",
                                          });
                                        }
                                      }}
                                      size={26}
                                      className="cursor-pointer text-[#fff]"
                                    />
                                  ) : (
                                    <IoMdRemove
                                      onClick={() => remove(index)}
                                      size={26}
                                      className="cursor-pointer text-[#fff]"
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  <Button
                    className="mt-5"
                    isLoading={addProductLoading}
                    onClick={handleSelectFieldValidation}
                  >
                    <p>Continue</p>
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
          <AddCategory
            open={isCategoryOpen}
            setShowDrawer={setIsCategoryOpen}
          />
          <AddSubCategory
            open={isSubCategoryOpen}
            setShowDrawer={setIsSubCategoryOpen}
          />
          <AddVendor
            callback={() => getSupplier("")}
            open={isVendorOpen}
            setShowDrawer={setIsVendorOpen}
          />
        </Container>
      )}
    </div>
  );
}

export default AddProductModal;