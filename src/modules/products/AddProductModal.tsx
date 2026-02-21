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
import { X, Package, Hash, Plus } from "lucide-react";

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
      }),
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

const fieldClass = (hasError?: boolean) =>
  cn(
    "w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none",
    "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50",
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
      : "border-gray-200 bg-white",
  );

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
    {children}
  </p>
);

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
    serial_number?.productSerialNumbers,
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
    new Set(productsData?.map((product) => product.product_name)),
  ).map((productName) => ({
    productName,
  }));

  const optionsRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (result) {
      return result.filter((item) =>
        item.productName.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }
    return [];
  }, [result, searchValue]);

  const uniqueSN = (
    data: { sn: string }[],
    setErrors: (errors: FormikErrors<{ items: { sn: string }[] }>) => void,
    salesResult: { serial_number: string; productId: string }[],
    productResult: { serial_number: string; productId: string }[],
  ) => {
    const duplicates = data.filter((item, index, self) =>
      self.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && item.sn === otherItem.sn,
      ),
    );

    const snExistsInOtherSources = data.filter((item) =>
      fullSerialNumber.some((existingItem) => existingItem === item.sn),
    );

    const errors: FormikErrors<{ items: { sn: string }[] }> = { items: [] };

    if (duplicates.length > 0) {
      toast.error("Multiple items with duplicate SNs found");
      data.forEach((item, index) => {
        const hasDuplicate = duplicates.some((d) => d.sn === item.sn);
        if (hasDuplicate) {
          if (!errors.items) errors.items = [];
          errors.items[index] = { sn: "Exists in multiple items" };
        }
      });
    }

    if (snExistsInOtherSources.length > 0) {
      toast.error("Some serial numbers already exist in the system");
      data.forEach((item, index) => {
        const existsInSources = snExistsInOtherSources.some(
          (s) => s.sn === item.sn,
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
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
      {ordersData && productsData && (
        <div className="no-scrollbar w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Package size={17} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">
                  Add New Product
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Fill in the product details below
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddProduct(false)}
              className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <div className="px-5 py-5 sm:px-6 flex-1 overflow-y-auto">
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
                  })),
                );

                if (values.items.length != parseInt(values.quantity)) {
                  toast.warn(
                    "Quantity and number of serial numbers added do not match",
                  );
                }
                const uniqueSn = uniqueSN(
                  values.items,
                  setErrors,
                  salesResult,
                  productResult,
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
                          error.data.message ?? "Something went wrong.",
                        );
                      });
                  }
                }
              }}
            >
              {({ touched, errors, values, setFieldValue }) => (
                <Form className="space-y-5">
                  {/* Product Info */}
                  <div className="rounded-xl border border-gray-100 p-4 space-y-4">
                    <SectionLabel>Product Info</SectionLabel>

                    {/* Product Name & Size */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="relative">
                        <label
                          className={cn(
                            "block text-xs font-semibold text-gray-600 mb-1.5",
                            errors.name && touched.name && "text-red-500",
                          )}
                        >
                          Product Name <span className="text-red-400">*</span>
                        </label>
                        <Field
                          className={fieldClass(
                            !!(errors.name && touched.name),
                          )}
                          name="name"
                          placeholder="e.g. iPhone 15 Pro Max"
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
                          className="mt-1 text-xs text-red-500"
                        />
                        {filteredOptions &&
                          filteredOptions.length > 0 &&
                          showSuggestion && (
                            <div
                              className="absolute top-full z-20 mt-1.5 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg"
                              ref={optionsRef}
                            >
                              {filteredOptions.map((value, index) => (
                                <button
                                  type="button"
                                  className="w-full text-left cursor-pointer border-b border-gray-50 px-4 py-2.5 text-sm last:border-0 hover:bg-indigo-50 transition-colors"
                                  key={index}
                                  onClick={() => {
                                    setSearchValue(value.productName);
                                    setShowSuggestion(false);
                                    setFieldValue("name", searchValue);
                                  }}
                                >
                                  <span className="font-medium text-gray-800">
                                    {value.productName}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>

                      <div>
                        <SelectField
                          searchPlaceholder="Enter size"
                          className="w-full -mt-2"
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
                          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                          onClick={() => setIsSubCategoryOpen(true)}
                        >
                          <Plus size={12} /> Add Size
                        </button>
                      </div>
                    </div>

                    {/* Quantity, Purchase Price, Sales Price */}
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                      <div>
                        <Input
                          name="quantity"
                          type="number"
                          title="Quantity"
                          placeholder="0"
                          errors={errors.quantity}
                          touched={touched.quantity}
                          width="w-full h-[38px] -mt-[0.5px]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Purchase Price <span className="text-red-400">*</span>
                        </label>
                        <Field
                          className={fieldClass(
                            !!(errors.purchasePrice && touched.purchasePrice),
                          )}
                          name="purchasePrice"
                          placeholder="0.00"
                          value={formatNumber(values.purchasePrice)}
                          onChange={(e) => {
                            const formattedValue = e.target.value.replace(
                              /[,a-zA-Z]/g,
                              "",
                            );
                            setFieldValue("purchasePrice", formattedValue);
                          }}
                        />
                        <ErrorMessage
                          name="purchasePrice"
                          component="div"
                          className="mt-1 text-xs text-red-500"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Sales Price
                        </label>
                        <Field
                          className={fieldClass()}
                          name="salesPrice"
                          placeholder="0.00"
                          value={formatNumber(values.salesPrice)}
                          onChange={(e) => {
                            const formattedValue = e.target.value.replace(
                              /[,a-zA-Z]/g,
                              "",
                            );
                            setFieldValue("salesPrice", formattedValue);
                          }}
                        />
                        <ErrorMessage
                          name="salesPrice"
                          component="div"
                          className="mt-1 text-xs text-red-500"
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-xs font-semibold text-gray-600 mb-1.5"
                      >
                        Date
                      </label>
                      <Field
                        className={fieldClass()}
                        name="date"
                        type="date"
                        value={values.date}
                      />
                      <ErrorMessage
                        name="date"
                        component="div"
                        className="mt-1 text-xs text-red-500"
                      />
                    </div>
                  </div>

                  {/* Vendor */}
                  <div className="rounded-xl border border-gray-100 p-4 space-y-3">
                    <SectionLabel>Vendor</SectionLabel>
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
                        supplierData?.map((item) => ({
                          name: `${item.first_name} ${item.last_name}`,
                          id: item.id,
                        })) || []
                      }
                    />
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      onClick={() => setIsVendorOpen(true)}
                    >
                      <Plus size={12} /> Add Vendor
                    </button>
                  </div>

                  {/* Description */}
                  <div className="rounded-xl border border-gray-100 p-4">
                    <SectionLabel>Description</SectionLabel>
                    <Input
                      name="description"
                      as="textarea"
                      title=""
                      placeholder="Enter product description (optional)"
                      errors={errors.description}
                      touched={touched.description}
                      width="w-full min-h-[80px] p-3"
                    />
                  </div>

                  {/* Serial Numbers */}
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <SectionLabel>Serial Numbers</SectionLabel>
                      <div className="flex items-center gap-1.5">
                        <Hash size={11} className="text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {values.items.length} / {values.quantity || 0}
                        </span>
                      </div>
                    </div>

                    <FieldArray name="items">
                      {({ remove, push }) => (
                        <div className="space-y-2">
                          {values.items.length > 0 &&
                            values.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <div className="flex-1">
                                  <Field
                                    name={`items[${index}].sn`}
                                    className={fieldClass(
                                      !!errors.items?.[index],
                                    )}
                                    placeholder={`Serial Number ${index + 1}`}
                                  />
                                  <ErrorMessage
                                    name={`items[${index}].sn`}
                                    component="div"
                                    className="mt-1 text-xs text-red-500"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                                    index === values.items.length - 1
                                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                      : "bg-red-50 text-red-500 hover:bg-red-100",
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
                                    <IoIosAdd size={18} />
                                  ) : (
                                    <IoMdRemove size={18} />
                                  )}
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </FieldArray>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 pb-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="w-full sm:w-auto rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      isLoading={addProductLoading}
                      onClick={handleSelectFieldValidation}
                      className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-sm font-medium"
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
        </div>
      )}
    </div>
  );
}

export default AddProductModal;
