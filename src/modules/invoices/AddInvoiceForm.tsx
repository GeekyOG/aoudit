import {
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
  FormikErrors,
  FormikProps,
} from "formik";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "../../ui/Button";
import { useLazyGetProductsQuery } from "../../api/productApi";
import SelectField from "../../components/input/SelectField";
import { useLazyGetCustomersQuery } from "../../api/customerApi";
import * as Yup from "yup";
import {
  useAddOrderMutation,
  useLazyGetOrdersQuery,
} from "../../api/ordersApi";
import { toast } from "react-toastify";
import AddCustomer from "../customers/AddCustomer";
import SnSelectField from "../../components/input/SnSelectField";
import SizeSelectField from "../../components/input/sizeSlelectField";
import { useLazyGetSubCategoriesQuery } from "../../api/subCategories";
import { useLazyGetMetricsQuery } from "../../api/metrics";
import { Switch } from "antd";
import { formatNumber } from "../../utils/format";
import SelectProductField from "../../components/input/selectProductField";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

const validationSchema = Yup.object({
  inv: Yup.string(),
  date: Yup.date(),
  items: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().optional(),
        id: Yup.string().required("required"),
        sn: Yup.string().required("required"),
        size: Yup.string().optional(),
        description: Yup.string().optional(),
        amount: Yup.string().required("required").min(1, "Amount cannot be 0"),
        amountPaid: Yup.string()
          .required("required")
          .max(Yup.ref("amount"), "Amount Paid cannot be greater than Amount"),
      })
    )
    .min(1, "At least one item is required"),
});

interface AddInvoicesProps {
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  sn?: string;
  id?: string;
  description?: string;
  size?: string;
  borrow?: boolean;
}

function AddInvoices({
  setDialogOpen,
  sn,
  id,
  description,
  size,
  borrow,
}: AddInvoicesProps) {
  const [getProduct, { data: productsData }] = useLazyGetProductsQuery();
  const [getOrders] = useLazyGetOrdersQuery();
  const [getMetric] = useLazyGetMetricsQuery();
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
        items: {
          id: string;
          sn: string;
          amount: number;
          amountPaid: number;
          size: string;
        }[];
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

  const [getCustomers, { isFetching: customerLoading, data: customerData }] =
    useLazyGetCustomersQuery();

  useEffect(() => {
    getCustomers("");
  }, [getCustomers]);

  const [isCustomerOpen, setIsCustomerOpen] = useState(false);

  const [serialCodesForProducts, setSerialCodesForProducts] = useState<{
    [key: string]: any[];
  }>({});

  const [addOrder, { isLoading: addOrderLoading }] = useAddOrderMutation();
  const result = productsData?.flatMap((product) =>
    JSON.parse(product.serial_numbers).map((serial_number) => ({
      serial_number,
      productId: product.id,
      productName: product.product_name,
    }))
  );

  const fetchSerialCodes = (productId: string, index: number) => {
    if (productId) {
      const response = result?.filter((item) => item.productName === productId);
      setSerialCodesForProducts((prevState) => {
        return {
          ...prevState,
          [index]: response || [],
        };
      });
    }
  };

  useEffect(() => {
    getProduct("");
  }, []);

  const [getSubCategories, { data: subCategoryData }] =
    useLazyGetSubCategoriesQuery();

  useEffect(() => {
    getSubCategories("");
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [checked, setChecked] = useState(borrow ? true : false);

  const handleToggleModal = () => {
    setChecked(!checked);
  };

  const userData = JSON.parse(localStorage.getItem("user") ?? "");

  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const formikRef = useRef<FormikProps<any>>(null);

  const initialItems = sn
    ? [
        {
          id: id || "",
          sn: sn || "",
          amount: 0,
          amountPaid: 0,
          color: "",
          size: size || "",
          description: description || "",
        },
      ]
    : [
        {
          id: "",
          sn: "",
          amount: 0,
          amountPaid: 0,
          color: "",
          size: "",
        },
      ];

  return (
    <div className="rounded-lg bg-white">
      <Formik
        innerRef={formikRef}
        initialValues={{
          customerId: "",
          inv: "",
          date: getTodayDate(),
          items: initialItems,
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setErrors }) => {
          const valid = handleSelectFieldValidation();
          const uniqueSn = uniqueSN(values.items, setErrors);

          if (valid && uniqueSn)
            addOrder({
              check: checked,
              customerId: selectedCustomerId,
              invoiceNumber: values.inv,
              date: values.date,
              soldBy: `${userData.firstname} ${userData.lastname}`,
              items: values.items.map((item) => ({
                productId: item.id,
                serial_number: item.sn,
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
                toast.success("Sale added successfully");
                setDialogOpen(false);
                getMetric("");
                getProduct("");
                getOrders({});
              })
              .catch((error) => {
                toast.error(error.data.message ?? "Something went wrong.");
              });
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-6">
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

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ShoppingCart size={18} className="text-gray-500" />
                  Borrowed
                </label>
                <Switch
                  className="h-6"
                  defaultChecked
                  checked={checked}
                  onChange={handleToggleModal}
                />
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
                <h3 className="text-base font-semibold text-gray-900">Items</h3>
              </div>

              <FieldArray name="items">
                {({ remove, push }) => (
                  <div className="space-y-5">
                    {values.items.length > 0 &&
                      values.items.map((item, index) => {
                        const providedSN = {
                          serial_number: item?.sn,
                          productId: item?.id,
                        };

                        const providedItem = {
                          product_name:
                            item.id && productsData
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
                                  if (values.items.length !== 1) {
                                    remove(index);
                                  }
                                }}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                Remove
                              </button>
                            </div>

                            <div className="flex gap-4">
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
                                  searchPlaceholder="Select SN"
                                  providedSN={providedSN}
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
                                      ? formatNumber(values.items[index].amount)
                                      : 0
                                  }
                                  onChange={(e) => {
                                    const formattedValue =
                                      e.target.value.replace(/[,a-zA-Z]/g, "");
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
                                      e.target.value.replace(/[,a-zA-Z]/g, "");
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
                            </div>

                            <div className="mt-4">
                              <label
                                htmlFor={`items[${index}].description`}
                                className="mb-2 block text-sm font-semibold text-gray-700"
                              >
                                Description
                              </label>
                              <Field
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm shadow-sm"
                                disabled
                                name={`items[${index}].description`}
                                placeholder="Product description"
                              />
                            </div>
                          </div>
                        );
                      })}

                    <button
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      type="button"
                      onClick={() =>
                        push({
                          id: "",
                          sn: "",
                          amount: 0,
                          amountPaid: 0,
                          product_name: "",
                          size: "",
                          description: "",
                        })
                      }
                    >
                      <Plus size={18} />
                      Add Another Item
                    </button>
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
                isLoading={addOrderLoading}
                onClick={handleSelectFieldValidation}
                className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Sale
              </Button>
            </div>
          </Form>
        )}
      </Formik>

      <AddCustomer open={isCustomerOpen} setShowDrawer={setIsCustomerOpen} />
    </div>
  );
}

export default AddInvoices;
