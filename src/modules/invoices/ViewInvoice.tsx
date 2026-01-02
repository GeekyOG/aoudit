import {
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
  FormikErrors,
} from "formik";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Button from "../../ui/Button";
import { useLazyGetProductsQuery } from "../../api/productApi";
import SelectField from "../../components/input/SelectField";
import { useGetCustomerQuery } from "../../api/customerApi";
import * as Yup from "yup";
import {
  useLazyGetOrderQuery,
  useLazyGetOrdersQuery,
  useUpdateOrderMutation,
} from "../../api/ordersApi";
import { toast } from "react-toastify";
import AddCustomer from "../customers/AddCustomer";
import DataLoading from "../../ui/DataLoading";
import SnSelectField from "../../components/input/SnSelectField";
import SizeSelectField from "../../components/input/sizeSlelectField";
import { useLazyGetSubCategoriesQuery } from "../../api/subCategories";
import { useLazyGetMetricsQuery } from "../../api/metrics";
import { formatNumber } from "../../utils/format";
import SelectProductField from "../../components/input/selectProductField";
import { Plus, Trash2, FileText, Tag } from "lucide-react";

const validationSchema = Yup.object({
  inv: Yup.string(),
  date: Yup.date(),
  items: Yup.array()
    .of(
      Yup.object({
        itemId: Yup.string().required("Item is required"),
        id: Yup.string().required("Item is required"),
        sn: Yup.string().required("Serial Number is required"),
        size: Yup.string().optional(),
        customDescription: Yup.string().optional(),

        amount: Yup.number().required("Amount is required"),
        amountPaid: Yup.number().required("Amount Paid is required"),
      })
    )
    .min(1, "At least one item is required"),
});

interface ViewInvoiceProps {
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  id: string;
}

function ViewInvoice({ setDialogOpen, id }: ViewInvoiceProps) {
  const [getProducts, { data: productsData }] = useLazyGetProductsQuery();
  const [getMetric] = useLazyGetMetricsQuery();
  const [getOrder, { data, isLoading }] = useLazyGetOrderQuery();

  useEffect(() => {
    getOrder(id);
  }, []);

  const [getOrders] = useLazyGetOrdersQuery();
  const [selectedCustomer, setSelectedCustomer] = useState("Select an option");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerError, setSelectedCustomerError] = useState(false);

  const uniqueSN = (
    data: {
      id: string;
      sn: string;
      amount: number;
      amountPaid: number;
    }[],
    setErrors: (
      errors: FormikErrors<{
        items: { id: string; sn: string; amount: number; amountPaid: number }[];
      }>
    ) => void
  ) => {
    const duplicates = data.filter((item, index, self) =>
      self.some(
        (otherItem, otherIndex) =>
          otherIndex !== index &&
          item.id === otherItem.id &&
          item.sn === otherItem.sn
      )
    );

    if (duplicates.length > 0) {
      toast.error("Multiple items with duplicate SNs found");

      const errors: FormikErrors<{
        items: { id: string; sn: string; amount: number; amountPaid: number }[];
      }> = { items: [] };

      data.forEach((item, index) => {
        const hasDuplicate = duplicates.some(
          (duplicateItem) =>
            duplicateItem.sn === item.sn && duplicateItem.id === item.id
        );

        if (hasDuplicate) {
          if (!errors.items) errors.items = [];
          errors.items[index] = {
            sn: "Exists in multiple items",
          };
        }
      });

      setErrors(errors);
      return false;
    }

    return true;
  };

  const handleSelectFieldValidation = () => {
    if (selectedCustomer === "Select an option") {
      setSelectedCustomerError(true);
      return false;
    } else {
      setSelectedCustomerError(false);
      return true;
    }
  };

  const { isLoading: customerLoading, data: customerData } =
    useGetCustomerQuery("");

  const [isCustomerOpen, setIsCustomerOpen] = useState(false);

  const [serialCodesForProducts, setSerialCodesForProducts] = useState<{
    [key: string]: any[];
  }>({});

  const [updateOrder, { isLoading: updateLoading }] = useUpdateOrderMutation();

  const result = productsData?.flatMap((product) =>
    JSON.parse(product.serial_numbers).map((serial_number) => ({
      serial_number,
      productId: product.id,
    }))
  );

  const fetchSerialCodes = async (
    productId: string,
    index: number,
    value?: { serial_number: string; productId: number }
  ) => {
    if (productId !== "") {
      try {
        const response = result?.filter((item) => item.productId === productId);

        setSerialCodesForProducts((prevState) => ({
          ...prevState,
          [index]: value
            ? [
                {
                  serial_number: value.serial_number,
                  productId: value.productId,
                },
                ...response,
              ]
            : response || [],
        }));
      } catch (error) {
        console.error("Error fetching serial codes: ", error);
      }
    }
  };

  useEffect(() => {
    if (data) {
      setSelectedCustomer(
        `${data[0]?.Sale.Customer?.first_name} ${data[0]?.Sale.Customer?.last_name}`
      );
      setSelectedCustomerId(data[0]?.Sale.customerId);

      data?.map((item: any, i) => {
        fetchSerialCodes("", i, {
          serial_number: item.serial_number,
          productId: item.productId,
        });
      });
    }
  }, [data]);

  useEffect(() => {
    getProducts("");
  }, []);

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

  const initialValues = {
    status: data ? data[0]?.Sale?.status || "" : "",
    customerId: selectedCustomerId || "",
    inv: data ? data[0]?.Sale?.invoiceNumber || "" : "",
    date: data ? formatDate(data[0]?.Sale?.date) : getTodayDate(),
    items: data?.map((item: any, i) => ({
      itemId: item.id || "",
      id: item.productId || "",
      sn: item.serial_number || "",
      customDescription: item.description,
      amount: item.amount || 0,
      amountPaid: item.amount_paid || 0,
      size: item.size || "",
    })) || [{ id: "", sn: "", amount: 0, amountPaid: 0, size: "" }],
  };

  useEffect(() => {
    data?.map((item, index) => {
      fetchSerialCodes(item?.Product?.id || "", index);
    });
  }, [data]);

  const [getSubCategories, { data: subCategoryData }] =
    useLazyGetSubCategoriesQuery();

  useEffect(() => {
    getSubCategories("");
  }, []);

  return (
    <div className="rounded-lg bg-white">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <DataLoading />
        </div>
      )}

      {data && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={(values, { setErrors }) => {
            const valid = handleSelectFieldValidation();
            const uniqueSn = uniqueSN(values.items, setErrors);

            if (valid && uniqueSn)
              updateOrder({
                id: id,
                status: values.status,
                customerId: selectedCustomerId,
                invoiceNumber: values.inv,
                date: values.date,
                items: values.items.map((item) => ({
                  id: item.itemId,
                  productId: item.id,
                  serial_number: item.sn,
                  description: item.customDescription,
                  amount: item.amount,
                  amount_paid: item.amountPaid,
                  size: item.size,
                })),
                total_amount: values.items.reduce(
                  (acc, item) => Number(acc) + Number(item.amount),
                  0
                ),
                total_paid: values.items.reduce(
                  (acc, item) => Number(acc) + Number(item.amountPaid),
                  0
                ),
              })
                .unwrap()
                .then(() => {
                  getOrder(id);
                  toast.success("Successfully Updated");
                  setDialogOpen(false);
                  getMetric("");
                  getProducts("");
                  getOrders({});
                })
                .catch((error) => {
                  toast.error(error.data.message ?? "Something went wrong.");
                });
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Tag size={18} className="text-gray-500" />
                    Status
                  </label>
                  <Field
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    as="select"
                    name="status"
                  >
                    <option value="">Select status</option>
                    {[
                      "pending",
                      "completed",
                      ...(data?.length > 1 ? [] : ["returned"]),
                      "borrowed",
                    ].map((option, i) => (
                      <option key={i} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </Field>
                </div>

                <div>
                  <label
                    htmlFor="inv"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Invoice Number{" "}
                    <span className="text-xs font-normal text-gray-500">
                      (optional)
                    </span>
                  </label>
                  <Field
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    name="inv"
                    placeholder="Enter invoice number"
                    value={values.inv}
                  />
                  <ErrorMessage
                    name="inv"
                    component="div"
                    className="mt-1.5 text-xs text-red-600"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <SelectField
                    searchPlaceholder="Enter customer name"
                    className="w-full"
                    title="Customer"
                    error={selectedCustomerError}
                    selected={selectedCustomer}
                    setId={setSelectedCustomerId}
                    setSelected={setSelectedCustomer}
                    isLoading={customerLoading}
                    options={
                      customerData?.map((item) => ({
                        name: `${item.first_name} ${item.last_name}`,
                        id: item.id,
                      })) || []
                    }
                  />

                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    onClick={() => setIsCustomerOpen(true)}
                  >
                    <Plus size={16} />
                    Add Customer
                  </button>
                </div>
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
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Items
                  </h3>
                </div>

                <FieldArray name="items">
                  {({ remove, push }) => (
                    <div className="space-y-5">
                      {values.items.length > 0 &&
                        values.items.map((item, index) => {
                          const providedSN = {
                            serial_number: item?.sn,
                            productId: item?.productId,
                          };

                          const providedItem = {
                            product_name: item.id
                              ? productsData.find((p) => p.id === item.id)
                                  .product_name
                              : "",
                            productId: item.id,
                          };

                          const providedSize = item?.size;

                          return (
                            <div
                              key={index}
                              className="rounded-lg border border-gray-200 bg-white p-5"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">
                                  Item #{index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFieldValue(`items[${index}].sn`, "");
                                    setFieldValue(`items[${index}].id`, "");
                                    setFieldValue(`items[${index}].size`, "");
                                    remove(index);
                                  }}
                                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Remove
                                </button>
                              </div>

                              <div className="flex gap-4 lg:grid-cols-3">
                                <div>
                                  <label
                                    htmlFor={`items[${index}].id`}
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                  >
                                    Product Name
                                  </label>
                                  <SelectProductField
                                    snIndex={index}
                                    values={values}
                                    setFieldValue={setFieldValue}
                                    options={productsData?.filter(
                                      (product, index, self) =>
                                        index ===
                                        self.findIndex(
                                          (p) =>
                                            p.product_name ===
                                            product.product_name
                                        )
                                    )}
                                    searchPlaceholder="Select Item"
                                    fetchSerialCodes={fetchSerialCodes}
                                    providedItem={providedItem}
                                  />
                                  <ErrorMessage
                                    name={`items[${index}].id`}
                                    component="div"
                                    className="mt-1.5 text-xs text-red-600"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`items[${index}].sn`}
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                  >
                                    Serial Number
                                  </label>
                                  <SnSelectField
                                    serialCodesForProducts={
                                      serialCodesForProducts
                                    }
                                    snIndex={index}
                                    values={values}
                                    setFieldValue={setFieldValue}
                                    options={serialCodesForProducts[index]}
                                    productsData={productsData}
                                    providedSN={providedSN}
                                    searchPlaceholder="Select SN"
                                  />
                                  <ErrorMessage
                                    name={`items[${index}].sn`}
                                    component="div"
                                    className="mt-1.5 text-xs text-red-600"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`items[${index}].amount`}
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                  >
                                    Amount
                                  </label>
                                  <Field
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    name={`items[${index}].amount`}
                                    placeholder="0.00"
                                    value={
                                      values.items[index].amount !== 0
                                        ? formatNumber(
                                            values.items[index].amount
                                          )
                                        : 0
                                    }
                                    onChange={(e) => {
                                      const formattedValue =
                                        e.target.value.replace(
                                          /[,a-zA-Z]/g,
                                          ""
                                        );
                                      setFieldValue(
                                        `items[${index}].amount`,
                                        formattedValue
                                      );
                                    }}
                                  />
                                  <ErrorMessage
                                    name={`items[${index}].amount`}
                                    component="div"
                                    className="mt-1.5 text-xs text-red-600"
                                  />
                                </div>
                              </div>

                              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                <div>
                                  <label
                                    htmlFor={`items[${index}].amountPaid`}
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                  >
                                    Amount Paid
                                  </label>
                                  <Field
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    name={`items[${index}].amountPaid`}
                                    placeholder="0.00"
                                    value={formatNumber(
                                      values.items[index].amountPaid
                                    )}
                                    onChange={(e) => {
                                      const formattedValue =
                                        e.target.value.replace(
                                          /[,a-zA-Z]/g,
                                          ""
                                        );
                                      setFieldValue(
                                        `items[${index}].amountPaid`,
                                        formattedValue
                                      );
                                    }}
                                  />
                                  <ErrorMessage
                                    name={`items[${index}].amountPaid`}
                                    component="div"
                                    className="mt-1.5 text-xs text-red-600"
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`items[${index}].size`}
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                  >
                                    Size
                                  </label>
                                  <SizeSelectField
                                    serialCodesForProducts={
                                      serialCodesForProducts
                                    }
                                    snIndex={index}
                                    values={values}
                                    setFieldValue={setFieldValue}
                                    options={subCategoryData}
                                    searchPlaceholder="Select Size"
                                    productsData={productsData}
                                    providedSN={providedSize}
                                  />
                                  <ErrorMessage
                                    name={`items[${index}].size`}
                                    component="div"
                                    className="mt-1.5 text-xs text-red-600"
                                  />
                                </div>

                                <div className="mt-4">
                                  <label
                                    htmlFor={`items[${index}].customDescription`}
                                    className="mb-2 block text-sm font-semibold text-gray-700"
                                  >
                                    Custom Description
                                  </label>
                                  <Field
                                    as="textarea"
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm shadow-sm"
                                    name={`items[${index}].customDescription`}
                                    placeholder="Product description"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* <button
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                        type="button"
                        onClick={() =>
                          push({
                            itemId: uuidv4(),
                            id: "",
                            sn: "",
                            amount: 0,
                            amountPaid: 0,
                            product_name: "",
                            size: "",
                          })
                        }
                      >
                        <Plus size={18} />
                        Add Another Item
                      </button> */}
                    </div>
                  )}
                </FieldArray>
              </div>

              <div className="flex justify-end gap-3 border-t pt-6">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Button
                  isLoading={updateLoading}
                  onClick={handleSelectFieldValidation}
                  className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  Update Sale
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      <AddCustomer open={isCustomerOpen} setShowDrawer={setIsCustomerOpen} />
    </div>
  );
}

export default ViewInvoice;
