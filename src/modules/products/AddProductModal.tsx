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
import {
  useLazyGetSupplierQuery,
  useLazyGetSuppliersQuery,
} from "../../api/vendorApi";
import {
  useAddProductMutation,
  useLazyGetProductsQuery,
} from "../../api/productApi";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { cn } from "../../utils/cn";
import { useLazyGetOrdersQuery } from "../../api/ordersApi";
import { formatNumber } from "../../utils/format";
import { useGetSerialNumbersQuery } from "../../api/metrics";

const addProductValidation = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  date: Yup.date(),
  quantity: Yup.number()
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
  salesPrice: Yup.string(),
  description: Yup.string().optional(),
  purchasePrice: Yup.string().required("Purchase price is required"),
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

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function AddProductModal({
  setShowAddProduct,
}: {
  setShowAddProduct: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [selectedCategory] = useState("Select an option");
  const [selectedCategoryError, setSelectedCategoryError] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState("Select an option");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedVendorError, setSelectedVendorError] = useState(false);

  const [selectedSize, setSelectedSize] = useState("Select an option");
  const [sizeId, setSelectedSizeId] = useState("");
  const [selectedSizeError, setSelectedSizeError] = useState(false);

  const [getProducts] = useLazyGetProductsQuery();

  useEffect(() => {
    getProducts("");
  }, []);
  const [getCategories] = useLazyGetCategoriesQuery();

  const [getSuppliers, { isLoading: supplierLoading, data: supplierData }] =
    useLazyGetSuppliersQuery();

  useEffect(() => {
    getSuppliers("");
  }, [getSuppliers]);

  const [addProduct, { isLoading: addProductLoading }] =
    useAddProductMutation();

  const [
    getSubCategories,
    { isLoading: subCategoryLoading, data: subCategoryData },
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
    if (selectedSize === "Select an option") {
      setSelectedSize("");
    } else {
      setSelectedSizeError(false);
    }
    if (selectedVendor === "Select an option") {
      setSelectedVendorError(true);
    } else {
      setSelectedVendorError(false);
    }
  };

  const [searchValue, setSearchValue] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const { data: serial_number } = useGetSerialNumbersQuery("");

  const parsedProductSerials = Array.isArray(
    serial_number?.productSerialNumbers
  )
    ? serial_number?.productSerialNumbers?.flatMap((entry) => {
        try {
          const parsed = JSON.parse(entry);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      })
    : [];

  const parsedSalesSerials = Array.isArray(serial_number?.saleItemSerialNumbers)
    ? serial_number?.saleItemSerialNumbers
    : [];

  const fullSerialNumber = [...parsedSalesSerials, ...parsedProductSerials];

  const [
    getOrders,
    { data: ordersData, isError, isSuccess, isLoading: ordersLoading },
  ] = useLazyGetOrdersQuery();

  const [getProduct, { isLoading: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  useEffect(() => {
    getOrders({});
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

    salesResult: { serial_number: string; productId: string }[],
    productResult: { serial_number: string; productId: string }[]
  ) => {
    const duplicates = data.filter((item, index, self) =>
      self.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && item.sn === otherItem.sn
      )
    );

    const snExistsInOtherSources = data.filter((item) =>
      fullSerialNumber.some((existingItem) => existingItem === item.sn)
    );

    const errors: FormikErrors<{
      items: { sn: string }[];
    }> = { items: [] };

    if (duplicates.length > 0) {
      toast.error("Multiple items with duplicate SNs found");

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
  const userData = JSON.parse(localStorage.getItem("user") ?? "");

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {ordersData && productsData && (
        <Container className="no-scrollbar mt-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5 lg:px-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Add New Product
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the product details below
              </p>
            </div>
            <button
              onClick={() => setShowAddProduct(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="px-6 py-6 lg:px-8">
            <Formik
              initialValues={{
                date: getTodayDate(),
                name: "",
                quantity: "",
                purchasePrice: "",
                description: "",
                salesPrice: 0,
                items: [{ sn: "" }],
              }}
              validationSchema={addProductValidation}
              onSubmit={(values, { resetForm, setErrors }) => {
                const salesResult = ordersData?.data?.map((order) => ({
                  serial_number: order.serial_number,
                  productId: order.productId,
                }));

                const productResult = productsData?.flatMap((product) =>
                  JSON.parse(product.serial_numbers).map((serial_number) => ({
                    serial_number,
                    productId: product.id,
                  }))
                );

                if (values.items.length != parseInt(values.quantity)) {
                  toast.warn(
                    "Quantity and number of serial numbers added do not match"
                  );
                }
                const uniqueSn = uniqueSN(
                  values.items,
                  setErrors,
                  salesResult,
                  productResult
                );
                if (
                  !selectedCategoryError ||
                  !selectedSizeError ||
                  !selectedVendorError
                ) {
                  if (
                    values.items.length == parseInt(values.quantity) &&
                    uniqueSn
                  ) {
                    addProduct({
                      product_name: searchValue,
                      price: values.salesPrice,
                      date: values.date,
                      quantity: parseInt(values.quantity),
                      purchase_amount: parseFloat(values.purchasePrice),
                      sales_price: values.salesPrice,
                      description: values.description,
                      size: selectedSize,
                      vendorId: selectedVendorId,
                      addedBy: `${userData.firstname} ${userData.lastname}`,
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
                          error.data.message ?? "Something went wrong."
                        );
                      });
                  }
                }
              }}
            >
              {({ touched, errors, values, setFieldValue }) => (
                <Form className="space-y-6">
                  {/* Product Name & Size */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="relative">
                      <label
                        htmlFor="name"
                        className={cn(
                          "mb-2 block text-sm font-semibold text-gray-700",
                          errors.name && touched.name && "text-red-600"
                        )}
                      >
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <Field
                        className={cn(
                          "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          errors.name &&
                            touched.name &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        )}
                        name="name"
                        placeholder="Enter product name"
                        value={searchValue}
                        onChange={(e) => {
                          setShowSuggestion(true);
                          setSearchValue(e.target.value);
                          setFieldValue("name", e.target.value);
                        }}
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="mt-1.5 text-xs text-red-600"
                      />

                      {filteredOptions &&
                        filteredOptions.length > 0 &&
                        showSuggestion && (
                          <div
                            className="absolute top-full z-20 mt-2 w-full max-h-[400px] overflow-y-scroll rounded-lg border border-gray-200 bg-white shadow-lg"
                            ref={optionsRef}
                          >
                            {filteredOptions?.map((value, index) => (
                              <div
                                className="cursor-pointer border-b border-gray-100 px-4 py-3 text-sm transition-colors last:border-0 hover:bg-blue-50"
                                key={index}
                                onClick={() => {
                                  setSearchValue(value.productName);
                                  setShowSuggestion(false);
                                  setFieldValue("name", searchValue);
                                }}
                              >
                                <p className="font-medium text-gray-900">
                                  {value.productName}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    <div>
                      <SelectField
                        searchPlaceholder="Enter size"
                        className="w-full"
                        title="Size"
                        error={selectedSizeError}
                        selected={selectedSize}
                        setId={setSelectedSizeId}
                        setSelected={setSelectedSize}
                        isLoading={subCategoryLoading}
                        options={subCategoryData || []}
                      />
                      <button
                        type="button"
                        className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                        onClick={() => setIsSubCategoryOpen(true)}
                      >
                        <IoIosAdd className="text-lg" />
                        Add Size
                      </button>
                    </div>
                  </div>

                  {/* Quantity, Purchase Price, Sales Price */}
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div>
                      <Input
                        name="quantity"
                        type="number"
                        title="Quantity"
                        placeholder="0"
                        errors={errors.quantity}
                        touched={touched.quantity}
                        width="w-full"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Purchase Price <span className="text-red-500">*</span>
                      </label>
                      <Field
                        className={cn(
                          "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                          errors.purchasePrice &&
                            touched.purchasePrice &&
                            "border-red-500"
                        )}
                        name="purchasePrice"
                        placeholder="0.00"
                        value={formatNumber(values.purchasePrice)}
                        onChange={(e) => {
                          const formattedValue = e.target.value.replace(
                            /[,a-zA-Z]/g,
                            ""
                          );
                          setFieldValue("purchasePrice", formattedValue);
                        }}
                      />
                      <ErrorMessage
                        name="purchasePrice"
                        component="div"
                        className="mt-1.5 text-xs text-red-600"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Sales Price
                      </label>
                      <Field
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        name="salesPrice"
                        placeholder="0.00"
                        value={formatNumber(values.salesPrice)}
                        onChange={(e) => {
                          const formattedValue = e.target.value.replace(
                            /[,a-zA-Z]/g,
                            ""
                          );
                          setFieldValue("salesPrice", formattedValue);
                        }}
                      />
                      <ErrorMessage
                        name="salesPrice"
                        component="div"
                        className="mt-1.5 text-xs text-red-600"
                      />
                    </div>
                  </div>

                  {/* Vendor */}
                  <div>
                    <SelectField
                      searchPlaceholder="Search vendor"
                      className="w-full"
                      title="Vendor"
                      error={selectedVendorError}
                      selected={selectedVendor}
                      setId={setSelectedVendorId}
                      setSelected={setSelectedVendor}
                      isLoading={supplierLoading}
                      options={
                        supplierData?.map((item) => {
                          return {
                            name: `${item.first_name} ${item.last_name}`,
                            id: item.id,
                          };
                        }) || []
                      }
                    />
                    <button
                      type="button"
                      className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                      onClick={() => setIsVendorOpen(true)}
                    >
                      <IoIosAdd className="text-lg" />
                      Add Vendor
                    </button>
                  </div>

                  {/* Description */}
                  <div>
                    <Input
                      name="description"
                      as="textarea"
                      title="Description"
                      placeholder="Enter product description"
                      errors={errors.description}
                      touched={touched.description}
                      width="w-full min-h-[100px] p-3"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label
                      htmlFor="date"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Date
                    </label>
                    <Field
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      name="date"
                      type="date"
                      value={values.date}
                    />
                    <ErrorMessage
                      name="date"
                      component="div"
                      className="mt-1.5 text-xs text-red-600"
                    />
                  </div>

                  {/* Serial Numbers Section */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                    <h3 className="mb-4 text-base font-semibold text-gray-900">
                      Serial Numbers
                    </h3>
                    <FieldArray name="items">
                      {({ remove, push }) => (
                        <div className="space-y-3">
                          {values.items.length > 0 &&
                            values.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div className="flex-1">
                                  <Field
                                    name={`items[${index}].sn`}
                                    className={cn(
                                      "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                                      errors.items?.[index] && "border-red-500"
                                    )}
                                    placeholder={`Serial Number ${index + 1}`}
                                  />
                                  <ErrorMessage
                                    name={`items[${index}].sn`}
                                    component="div"
                                    className="mt-1.5 text-xs text-red-600"
                                  />
                                </div>

                                <button
                                  type="button"
                                  className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                                    index === values.items.length - 1
                                      ? "bg-blue-600 text-white hover:bg-blue-700"
                                      : "bg-red-100 text-red-600 hover:bg-red-200"
                                  )}
                                  onClick={() => {
                                    if (index === values.items.length - 1) {
                                      if (
                                        values.items.length <
                                        parseInt(values.quantity)
                                      ) {
                                        push({ sn: "" });
                                      }
                                    } else {
                                      remove(index);
                                    }
                                  }}
                                >
                                  {index === values.items.length - 1 ? (
                                    <IoIosAdd size={20} />
                                  ) : (
                                    <IoMdRemove size={20} />
                                  )}
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 border-t pt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <Button
                      isLoading={addProductLoading}
                      onClick={handleSelectFieldValidation}
                      className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add Product
                    </Button>
                  </div>
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
            callback={() => getSuppliers("")}
            open={isVendorOpen}
            setShowDrawer={setIsVendorOpen}
          />
        </Container>
      )}
    </div>
  );
}

export default AddProductModal;
