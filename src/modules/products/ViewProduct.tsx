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
import AddCategory from "./AddCategoryDrawer";
import AddSubCategory from "./AddSubCategory";
import AddVendor from "../vendors/AddVendor";
import { useLazyGetCategoriesQuery } from "../../api/categoriesApi";
import { useLazyGetSubCategoriesQuery } from "../../api/subCategories";
import { useGetSupplierQuery } from "../../api/vendorApi";
import {
  useLazyGetProductQuery,
  useLazyGetProductsQuery,
  useUpdateProductMutation,
} from "../../api/productApi";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useLazyGetOrdersQuery } from "../../api/ordersApi";
import { formatNumber } from "../../utils/format";
import { cn } from "../../utils/cn";
import { useGetSerialNumbersQuery } from "../../api/metrics";
import { X, Pencil, Hash, Plus } from "lucide-react";

const productValidation = Yup.object().shape({
  name: Yup.string().required("Product name is required"),
  quantity: Yup.number().min(1, "Quantity must be at least 1"),
  salesPrice: Yup.number(),
  description: Yup.string().optional(),
  purchasePrice: Yup.number()
    .required("Purchase price is required")
    .min(100, "Purchase price must be at least 100"),
  items: Yup.array()
    .of(
      Yup.object().shape({
        sn: Yup.string().min(5, "SN must be at least 5 characters"),
      }),
    )
    .min(1, "At least one item is required"),
});

const fieldClass = (hasError?: boolean, disabled?: boolean) =>
  cn(
    "w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none",
    "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50",
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-50"
      : "border-gray-200",
    disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white",
  );

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
    {children}
  </p>
);

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
  const [, setSelectedSizeId] = useState("");
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
      inputFields?.filter((item) => inputFields.indexOf(item) !== index),
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
    if (selectedCategory === "Select an option") setSelectedCategoryError(true);
    else setSelectedCategoryError(false);
    if (selectedSize === "Select an option") setSelectedSizeError(true);
    else setSelectedSizeError(false);
    if (selectedVendor === "Select an option") setSelectedVendorError(true);
    else setSelectedVendorError(false);
  };

  const [getProduct, { isLoading, data }] = useLazyGetProductQuery();

  const updatedInputFields = data?.serial_numbers
    ? JSON.parse(data?.serial_numbers)
    : [];

  useEffect(() => {
    getProduct(id ?? "");
  }, []);

  useEffect(() => {
    if (data) {
      const updatedInputFields = JSON.parse(data.serial_numbers)?.map(
        (code, index) => ({
          value: code,
          index: index + 1,
          fetched: true,
        }),
      );
      setInputFields(updatedInputFields);
      setSelectedCategoryId(data.categoryId);
      setSelectedSize(data.size);
      setSelectedSizeId(data.subCategoryId);
      setSelectedVendor(
        `${data?.Vendor?.first_name} ${data?.Vendor?.last_name}`,
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
  const { data: serial_number } = useGetSerialNumbersQuery("");

  const parsedProductSerials = Array.isArray(
    serial_number?.productSerialNumbers,
  )
    ? serial_number?.productSerialNumbers
        ?.flatMap((entry) => {
          try {
            const parsed = JSON.parse(entry);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            return [];
          }
        })
        .filter((item) => !updatedInputFields.includes(item))
    : [];

  const parsedSalesSerials = Array.isArray(serial_number?.saleItemSerialNumbers)
    ? serial_number.saleItemSerialNumbers.flatMap((entry) => {
        try {
          const parsed = JSON.parse(entry);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      })
    : [];

  const fullSerialNumber = [...parsedSalesSerials, ...parsedProductSerials];

  useEffect(() => {
    getOrders({});
    getProducts("");
  }, [getProducts, getOrders]);

  const uniqueSN = (
    data: { sn: string }[],
    setErrors: (errors: FormikErrors<{ items: { sn: string }[] }>) => void,
  ) => {
    const errors: FormikErrors<{ items: { sn: string }[] }> = { items: [] };

    const duplicates = data.filter((item, index, self) =>
      self.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && item.sn === otherItem.sn,
      ),
    );

    if (duplicates.length > 0) {
      toast.error("Multiple items with duplicate SNs found");
      data.forEach((item, index) => {
        const hasDuplicate = duplicates.some((dup) => dup.sn === item.sn);
        if (hasDuplicate) {
          if (!errors.items) errors.items = [];
          errors.items[index] = { sn: "Exists in multiple items" };
        }
      });
    }

    const snExistsInOtherSources = data.filter((item) =>
      fullSerialNumber.includes(item.sn),
    );
    const snExistsInThisProduct = snExistsInOtherSources.filter((item) =>
      updatedInputFields.includes(item.sn),
    );
    const hasDub = snExistsInOtherSources.some((externalItem) =>
      snExistsInThisProduct.some(
        (productItem) => productItem.sn === externalItem.sn,
      ),
    );

    if (hasDub) {
      data?.map((item, index) => {
        snExistsInOtherSources?.map((item) => {
          snExistsInThisProduct?.map((p) => {
            if (item.sn == p.sn) setErrors(errors);
          });
        });
      });
    }

    if (
      snExistsInOtherSources.length > 0 &&
      snExistsInThisProduct.length === 0
    ) {
      toast.error("Some serial numbers already exist in the system");
      data.forEach((item, index) => {
        const existsExternally = snExistsInOtherSources.some(
          (e) => e.sn === item.sn,
        );
        if (existsExternally) {
          if (!errors.items) errors.items = [];
          errors.items[index] = {
            sn: "This serial number already exists in the system",
          };
        }
      });
    }

    if (snExistsInOtherSources.length > 0 && snExistsInThisProduct.length > 0) {
      data.forEach((item, index) => {
        const isConflicting = snExistsInOtherSources.some(
          (e) => e.sn === item.sn,
        );
        const isAlsoInThisProduct = snExistsInThisProduct.some(
          (t) => t.sn === item.sn,
        );
        console.log(isAlsoInThisProduct, "isAlsoInThisProduct", isConflicting);
        if (isConflicting && !isAlsoInThisProduct) {
          if (!errors.items) errors.items = [];
          errors.items[index] = {
            sn: "This serial number already exists in the system",
          };
        }
      });
    }

    const hasErrors =
      hasDub ||
      duplicates.length > 0 ||
      (snExistsInOtherSources.length > 0 && snExistsInThisProduct.length === 0);

    if (hasErrors) {
      setErrors(errors);
      return false;
    }
    return true;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTodayDate = () => formatDate(new Date());

  useEffect(() => {
    if (data) setSelectedVendorId(data.vendorId);
  }, [data]);

  const initialValues = {
    name: data?.product_name ?? "",
    description: data?.description ?? "",
    date: data ? formatDate(data?.date) : getTodayDate(),
    quantity: data
      ? (JSON.parse(data?.serial_numbers)?.length ?? 0) +
        (JSON.parse(data?.sold_serial_numbers)?.length ?? 0)
      : "",
    purchasePrice: data?.purchase_amount ?? "",
    salesPrice: data?.sales_price ?? "",
    items: data
      ? JSON.parse(data?.serial_numbers).length != 0 ||
        JSON.parse(data?.sold_serial_numbers)?.length != 0
        ? [
            ...JSON.parse(data?.serial_numbers),
            ...JSON.parse(data?.sold_serial_numbers),
          ]?.map((item: any) => ({
            sn: item || "",
          })) || [{ sn: "" }]
        : [{ sn: "" }]
      : [{ sn: "" }],
  };

  const result: { productName: any }[] = Array.from(
    new Set(productsData?.map((product) => product.product_name)),
  ).map((productName) => ({ productName }));

  const optionsRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState(data?.product_name ?? "");
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    setSearchValue(data?.product_name ?? "");
  }, [data]);

  const filteredOptions = useMemo(() => {
    if (result)
      return result.filter((item) =>
        item.productName.toLowerCase().includes(searchValue.toLowerCase()),
      );
    return [];
  }, [result, searchValue]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
      <div className="no-scrollbar w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Pencil size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                Edit Product
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Update product information and serial numbers
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
        {data && (
          <div className="px-5 py-5 sm:px-6 flex-1 overflow-y-auto">
            <Formik
              initialValues={initialValues}
              enableReinitialize={true}
              validationSchema={productValidation}
              onSubmit={(values, { setErrors }) => {
                const existingSerialNumbers = new Set(
                  initialValues.items.map((item) => item.sn),
                );

                const filteredSalesResult = ordersData?.data
                  ?.map((order) => ({
                    serial_number: order.serial_number,
                    productId: order.productId,
                  }))
                  .filter(
                    (sale) => !existingSerialNumbers.has(sale.serial_number),
                  );

                const filteredProductResult = productsData
                  ?.flatMap((product) =>
                    JSON.parse(product.serial_numbers).map((serial_number) => ({
                      serial_number,
                      productId: product.id,
                    })),
                  )
                  .filter(
                    (product) =>
                      !existingSerialNumbers.has(product.serial_number),
                  );

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

                const uniqueSn = uniqueSN(values.items, setErrors);
                if (values.items.length != parseInt(values.quantity)) {
                  toast.warn(
                    "Quantity and number of serial numbers added do not match",
                  );
                }
                if (
                  values.items.length == parseInt(values.quantity) &&
                  uniqueSn
                )
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
                      serial_numbers: values.items
                        ?.filter(
                          (value) =>
                            !JSON.parse(
                              data?.sold_serial_numbers ?? "[]",
                            ).includes(value.sn) &&
                            value.sn !== "" &&
                            value.sn != null &&
                            value.sn != undefined,
                        )
                        .map((value) => value.sn),
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
                      toast.error(
                        error.data.message ?? "Something went wrong.",
                      );
                    });
              }}
            >
              {({ touched, errors, values, setFieldValue }) => (
                <Form className="space-y-5">
                  {/* Product Info */}
                  <div className="rounded-xl border border-gray-100 p-4 space-y-4">
                    <SectionLabel>Product Info</SectionLabel>

                    {/* Name + Size */}
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
                                  key={index}
                                  className="w-full text-left cursor-pointer border-b border-gray-50 px-4 py-2.5 text-sm last:border-0 hover:bg-indigo-50 transition-colors"
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
                          options={subCategoryData}
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

                    {/* Quantity + Prices */}
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
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
                          name: `${item.first_name}`,
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
                      placeholder="Enter product description"
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
                            values.items.map((item, index) => {
                              const isSold = JSON.parse(
                                data?.sold_serial_numbers ?? "",
                              ).includes(values.items[index].sn);
                              return (
                                <div
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <div className="flex-1">
                                    <div className="relative">
                                      <Field
                                        disabled={isSold}
                                        name={`items[${index}].sn`}
                                        className={fieldClass(
                                          !!errors.items?.[index],
                                          isSold,
                                        )}
                                        placeholder={`Serial Number ${index + 1}`}
                                      />
                                      {isSold && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-rose-400 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                                          Sold
                                        </span>
                                      )}
                                    </div>
                                    <ErrorMessage
                                      name={`items[${index}].sn`}
                                      component="div"
                                      className="mt-1 text-xs text-red-500"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    disabled={
                                      isSold &&
                                      !(
                                        values.items.length <
                                        parseInt(values.quantity)
                                      )
                                    }
                                    className={cn(
                                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                                      index === values.items.length - 1
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "bg-red-50 text-red-500 hover:bg-red-100",
                                      isSold &&
                                        !(
                                          values.items.length <
                                          parseInt(values.quantity)
                                        ) &&
                                        "opacity-30 cursor-not-allowed",
                                    )}
                                    onClick={() => {
                                      if (index === values.items.length - 1) {
                                        if (
                                          values.items.length <
                                          parseInt(values.quantity)
                                        )
                                          push({ sn: "" });
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
                              );
                            })}
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
                      Update Product
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        <AddCategory open={isCategoryOpen} setShowDrawer={setIsCategoryOpen} />
        <AddSubCategory
          open={isSubCategoryOpen}
          setShowDrawer={setIsSubCategoryOpen}
        />
        <AddVendor open={isVendorOpen} setShowDrawer={setIsVendorOpen} />
      </div>
    </div>
  );
}

export default ViewProduct;
