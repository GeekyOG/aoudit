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
import { useLazyGetOrdersQuery } from "../../api/ordersApi";
import { formatNumber } from "../../utils/format";
import { cn } from "../../utils/cn";
const productValidation = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  quantity: Yup.number()

    .min(1, "Quantity must be at least 1"),
  salesPrice: Yup.number(),
  description: Yup.string().optional(),
  // .required("Sales price is required")
  purchasePrice: Yup.number()
    .required("Purchase price is required")
    .min(100, "Purchase price must be at least 100"),

  items: Yup.array()
    .of(
      Yup.object().shape({
        sn: Yup.string()

          .min(5, "SN must be at least 5 characters"),
      })
    )
    .min(1, "At least one item is required"),
});
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

  const [selectedSize, setSelectedSize] = useState("Select an option");
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedSizeError, setSelectedSizeError] = useState(false);

  const handleAddField = () => {
    setInputFields([
      ...inputFields,
      { value: "", index: inputFields.length + 1, fetched: false },
    ]);
  };

  const [getCategories, { isLoading: categoryLoading, data: categoryData }] =
    useLazyGetCategoriesQuery();

  const { isLoading: supplierLoading, data: supplierData } =
    useGetSupplierQuery("");

  const [updateProduct, { isLoading: addProductLoading }] =
    useUpdateProductMutation();

  const [
    getSubCategories,
    { isLoading: subCategoryLoading, data: subCategoryData },
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
    if (selectedSize === "Select an option") {
      setSelectedSizeError(true);
    } else {
      setSelectedSizeError(false);
    }
    if (selectedVendor === "Select an option") {
      setSelectedVendorError(true);
    } else {
      setSelectedVendorError(false);
    }
  };

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
      setSelectedCategoryId(data.categoryId);
      setSelectedSize(data.size);
      setSelectedSizeId(data.subCategoryId);
      setSelectedVendor(
        `${data?.Vendor?.first_name} ${data?.Vendor?.last_name}`
      );
      setSelectedVendorId(data.Vendor?.id);
    }
  }, [data]);

  const [
    getOrders,
    { data: ordersData, isError, isSuccess, isLoading: ordersLoading },
  ] = useLazyGetOrdersQuery();

  const [getProducts, { isLoading: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  useEffect(() => {
    getOrders("");
    getProducts("");
  }, [getProducts, getOrders]);

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

  // Utility function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Add leading 0
    const day = String(d.getDate()).padStart(2, "0"); // Add leading 0
    return `${year}-${month}-${day}`;
  };

  // Get today's date formatted as YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return formatDate(today);
  };

  useEffect(() => {
    if (data) {
      setSelectedVendorId(data.vendorId);
    }
  }, [data]);

  const initialValues = {
    name: data?.product_name ?? "",
    description: data?.description ?? "",
    date: data ? formatDate(data?.date) : getTodayDate(), // Prefill with sale date or today's date
    quantity: data ? (JSON.parse(data?.serial_numbers).length ?? "") : "",
    purchasePrice: data?.purchase_amount ?? "",
    salesPrice: data?.sales_price ?? "",

    items: data
      ? JSON.parse(data?.serial_numbers).length != 0
        ? JSON.parse(data?.serial_numbers)?.map((item: any, i) => ({
            sn: item || "",
          })) || [{ sn: "" }]
        : [{ sn: "" }]
      : [{ sn: "" }],
  };

  const result: { productName: any }[] = Array.from(
    new Set(productsData?.map((product) => product.product_name))
  ).map((productName) => ({
    productName,
  }));

  const optionsRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState(data?.product_name ?? "");
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    setSearchValue(data?.product_name ?? "");
  }, [data]);
  const filteredOptions = useMemo(() => {
    if (result) {
      return result.filter((item) =>
        item.productName.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    return [];
  }, [result, searchValue]);

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
            initialValues={initialValues}
            enableReinitialize={true}
            validationSchema={productValidation}
            onSubmit={(values, { setErrors }) => {
              const existingSerialNumbers = new Set(
                initialValues.items.map((item) => item.sn)
              );

              // Filter salesResult to exclude existing serial numbers
              const filteredSalesResult = ordersData
                ?.map((order) => ({
                  serial_number: order.serial_number,
                  productId: order.productId,
                }))
                .filter(
                  (sale) => !existingSerialNumbers.has(sale.serial_number)
                );

              // Filter productResult to exclude existing serial numbers
              const filteredProductResult = productsData
                ?.flatMap((product) =>
                  JSON.parse(product.serial_numbers).map((serial_number) => ({
                    serial_number,
                    productId: product.id,
                  }))
                )
                .filter(
                  (product) => !existingSerialNumbers.has(product.serial_number)
                );

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
                filteredSalesResult, // Pass sales data
                filteredProductResult // Pass product data
              );

              if (uniqueSn)
                updateProduct({
                  body: {
                    product_name: searchValue,
                    description: values.description,
                    date: values.date,
                    price: parseFloat(values.salesPrice),
                    quantity: parseInt(values.quantity),
                    purchase_amount: parseFloat(values.purchasePrice),
                    sales_price: parseFloat(values.salesPrice),
                    size: selectedSize,
                    vendorId: selectedVendorId,
                    serial_numbers: values.items?.map((value) => value.sn),
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
                    toast.error(error.data.message ?? "Something went wrong.");
                  });
            }}
          >
            {({ touched, errors, values, setFieldValue }) => {
              return (
                <Form>
                  <div className="mt-[50px] flex w-[100%] flex-col gap-3 lg:flex-row">
                    <div className="w-[100%] relative flex flex-col mt-2">
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

                      {filteredOptions &&
                        filteredOptions.length > 0 &&
                        showSuggestion && (
                          <div
                            className="bg-[#fff]  top-[60px] shadow-lg p-[14px] absolute w-[100%] z-[10]"
                            ref={optionsRef}
                          >
                            {filteredOptions?.map((value, index) => (
                              <div
                                className="border-b-[1px] py-[8px] cursor-pointer"
                                key={index}
                                onClick={() => {
                                  setSearchValue(value.productName);
                                  setShowSuggestion(false);
                                  setFieldValue("name", searchValue);
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
                        searchPlaceholder="Enter sub category name"
                        className="w-[100%]"
                        title="Size"
                        error={selectedSizeError}
                        selected={selectedSize}
                        setId={setSelectedSizeId}
                        setSelected={setSelectedSize}
                        isLoading={subCategoryLoading}
                        options={subCategoryData}
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
                      <label className="text-[0.75rem]">Purchase Price</label>
                      <Field
                        className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2"
                        name={`purchasePrice`}
                        value={formatNumber(values.purchasePrice)}
                        onChange={(e) => {
                          const formattedValue = e.target.value.replace(
                            /[,a-zA-Z]/g,
                            ""
                          );

                          setFieldValue(`purchasePrice`, formattedValue);
                        }}
                      />
                      <ErrorMessage
                        name={`purchasePrice`}
                        component="div"
                        className="text-[12px] font-[400] text-[#f00000]"
                      />
                    </div>

                    <div className=" w-[100%]">
                      <label className="text-[0.75rem]">Sales Price</label>
                      <Field
                        className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2"
                        name={`salesPrice`}
                        value={formatNumber(values.salesPrice)}
                        onChange={(e) => {
                          const formattedValue = e.target.value.replace(
                            /[,a-zA-Z]/g,
                            ""
                          );

                          setFieldValue(`salesPrice`, formattedValue);
                        }}
                      />
                      <ErrorMessage
                        name={`salesPrice`}
                        component="div"
                        className="text-[12px] font-[400] text-[#f00000]"
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

                  <div className="mt-5 flex w-[100%] gap-3">
                    <div className=" w-[100%]">
                      <Input
                        name="description"
                        as="textarea"
                        title="Description"
                        placeholder="Enter short description"
                        errors={errors.description}
                        touched={touched.description}
                        width="max-h-[200px] w-[100%] p-[12px]"
                      />
                    </div>
                  </div>

                  {/* Amount Field */}
                  <div className="flex flex-col ">
                    <label
                      htmlFor={`date`}
                      className="font-[500] text-[0.865rem] mt-3"
                    >
                      Date
                    </label>
                    <Field
                      className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2"
                      name={`date`}
                      type="date"
                      value={values.date}
                    />
                    <ErrorMessage
                      name={`date`}
                      component="div"
                      className="text-[12px] font-[400] text-[#f00000]"
                    />
                  </div>

                  {/* end */}

                  <hr className="my-5" />
                  <div className="flex flex-col gap-[5] ">
                    <p className="font-[500]">Enter Serial Number(s)</p>
                    <FieldArray name="items">
                      {({ remove, push }) => (
                        <div>
                          {values.items.length > 0 &&
                            values.items.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className="mt-5 flex w-[100%] items-center gap-[40px]"
                                >
                                  <div className="w-[100%]">
                                    <Field
                                      name={`items[${index}].sn`}
                                      className="max-h-[40px] w-[100%] rounded-[8px] border-[1px] px-[5px] py-[12px] text-[0.865rem] lg:max-w-[330px]"
                                      placeholder="Enter Serial Number"
                                      // Disable only if prefilled and has value
                                    />

                                    <ErrorMessage
                                      name={`items[${index}].sn`}
                                      component="div"
                                      className="text-[12px] font-[400] text-[#f00000]"
                                    />
                                  </div>

                                  <div className="rounded-[50%] bg-[#000] p-1">
                                    {index === values.items.length - 1 ? (
                                      <IoIosAdd
                                        onClick={() => {
                                          if (
                                            values.items.length <
                                            parseInt(values.quantity)
                                          ) {
                                            push({ sn: "" }); // Push new editable field
                                          }
                                        }}
                                        size={26}
                                        className="cursor-pointer text-[#fff]"
                                      />
                                    ) : (
                                      <IoMdRemove
                                        onClick={() => {
                                          remove(index); // Allow removal of all fields
                                        }}
                                        size={26}
                                        className="cursor-pointer text-[#fff]"
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
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
