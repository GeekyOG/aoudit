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

  const updatedInputFields = data?.serial_numbers
    ? JSON.parse(data?.serial_numbers)
    : [];

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

  const { data: serial_number } = useGetSerialNumbersQuery("");

  const parsedProductSerials = Array.isArray(
    serial_number?.productSerialNumbers
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
    data: {
      sn: string;
    }[],
    setErrors: (
      errors: FormikErrors<{
        items: { sn: string }[];
      }>
    ) => void
  ) => {
    const errors: FormikErrors<{ items: { sn: string }[] }> = { items: [] };

    const duplicates = data.filter((item, index, self) =>
      self.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && item.sn === otherItem.sn
      )
    );

    if (duplicates.length > 0) {
      toast.error("Multiple items with duplicate SNs found");

      data.forEach((item, index) => {
        const hasDuplicate = duplicates.some((dup) => dup.sn === item.sn);

        if (hasDuplicate) {
          if (!errors.items) errors.items = [];
          errors.items[index] = {
            sn: "Exists in multiple items",
          };
        }
      });
    }

    const snExistsInOtherSources = data.filter((item) =>
      fullSerialNumber.includes(item.sn)
    );

    const snExistsInThisProduct = snExistsInOtherSources.filter((item) =>
      updatedInputFields.includes(item.sn)
    );
    const hasDub = snExistsInOtherSources.some((externalItem) =>
      snExistsInThisProduct.some(
        (productItem) => productItem.sn === externalItem.sn
      )
    );
    if (hasDub) {
      data?.map((item, index) => {
        snExistsInOtherSources?.map((item) => {
          snExistsInThisProduct?.map((p) => {
            if (item.sn == p.sn) {
              setErrors(errors);
            }
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
          (externalItem) => externalItem.sn === item.sn
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
          (externalItem) => externalItem.sn === item.sn
        );

        const isAlsoInThisProduct = snExistsInThisProduct.some(
          (thisItem) => thisItem.sn === item.sn
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <Container className="no-scrollbar mt-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Edit Product
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update product information and serial numbers
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

        {data && (
          <div className="px-6 py-6 lg:px-8">
            <Formik
              initialValues={initialValues}
              enableReinitialize={true}
              validationSchema={productValidation}
              onSubmit={(values, { setErrors }) => {
                const existingSerialNumbers = new Set(
                  initialValues.items.map((item) => item.sn)
                );

                const filteredSalesResult = ordersData?.data
                  ?.map((order) => ({
                    serial_number: order.serial_number,
                    productId: order.productId,
                  }))
                  .filter(
                    (sale) => !existingSerialNumbers.has(sale.serial_number)
                  );

                const filteredProductResult = productsData
                  ?.flatMap((product) =>
                    JSON.parse(product.serial_numbers).map((serial_number) => ({
                      serial_number,
                      productId: product.id,
                    }))
                  )
                  .filter(
                    (product) =>
                      !existingSerialNumbers.has(product.serial_number)
                  );

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

                const uniqueSn = uniqueSN(values.items, setErrors);
                if (values.items.length != parseInt(values.quantity)) {
                  toast.warn(
                    "Quantity and number of serial numbers added do not match"
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
                        ?.filter((value) => {
                          return (
                            !JSON.parse(
                              data?.sold_serial_numbers ?? "[]"
                            ).includes(value.sn) &&
                            value.sn !== "" &&
                            value.sn != null &&
                            value.sn != undefined
                          );
                        })
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
                        error.data.message ?? "Something went wrong."
                      );
                    });
              }}
            >
              {({ touched, errors, values, setFieldValue }) => {
                return (
                  <Form className="space-y-6">
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
                          options={subCategoryData}
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
                              name: `${item.first_name}`,
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

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                      <h3 className="mb-4 text-base font-semibold text-gray-900">
                        Serial Numbers
                      </h3>
                      <FieldArray name="items">
                        {({ remove, push }) => (
                          <div className="space-y-3">
                            {values.items.length > 0 &&
                              values.items.map((item, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="flex-1">
                                      <Field
                                        disabled={JSON.parse(
                                          data?.sold_serial_numbers ?? ""
                                        ).includes(values.items[index].sn)}
                                        name={`items[${index}].sn`}
                                        className={cn(
                                          "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                                          JSON.parse(
                                            data?.sold_serial_numbers ?? ""
                                          ).includes(values.items[index].sn) &&
                                            "bg-gray-300",
                                          errors.items?.[index] &&
                                            "border-red-500"
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
                                      disabled={
                                        JSON.parse(
                                          data?.sold_serial_numbers ?? ""
                                        ).includes(values.items[index].sn) &&
                                        !(
                                          values.items.length <
                                          parseInt(values.quantity)
                                        )
                                      }
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
                                );
                              })}
                          </div>
                        )}
                      </FieldArray>
                    </div>

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
                        Update Product
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        )}

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
