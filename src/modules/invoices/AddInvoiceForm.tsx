import {
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
  FormikErrors,
} from "formik";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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

// Validation schema for form validation
const validationSchema = Yup.object({
  inv: Yup.string(),
  date: Yup.date(),
  items: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().optional(),
        id: Yup.string().required("required"),
        sn: Yup.string().required("required"),
        size: Yup.string().required(" required"),
        description: Yup.string(),
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
}

function AddInvoices({ setDialogOpen, sn, id }: AddInvoicesProps) {
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

      // Set errors for duplicate serial numbers
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
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Add leading 0 if needed
    const day = String(today.getDate()).padStart(2, "0"); // Add leading 0 if needed
    return `${year}-${month}-${day}`;
  };

  const [checked, setChecked] = useState(false);

  const handleToggleModal = () => {
    setChecked(!checked);
  };
  const userData = JSON.parse(localStorage.getItem("user") ?? "");

  const initialItems = sn
    ? [
        {
          id: id || "",
          sn: sn || "",
          amount: 0,
          amountPaid: 0,
          color: "",
          size: "",
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
    <div>
      <div>
        <Formik
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
                  (acc, item) => acc + item.amount,
                  0
                ),
                total_paid: values.items.reduce(
                  (acc, item) => acc + item.amountPaid,
                  0
                ),
              })
                .unwrap()
                .then(() => {
                  toast.success("Sale added successfully");
                  setDialogOpen(false);
                  getMetric("");
                  getProduct("");
                  getOrders("");
                })
                .catch((error) => {
                  toast.error(error.data.message ?? "Something went wrong.");
                });
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex flex-col gap-[15px]">
              <div>
                <SelectField
                  searchPlaceholder="Enter customer name"
                  className="w-[100%]"
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

                <p
                  className="cursor-pointer text-[0.75rem] text-[blue]"
                  onClick={() => setIsCustomerOpen(true)}
                >
                  Add Customer
                </p>
              </div>

              <div>
                <label className="text-[0.75rem] mr-2">Borrowed</label>

                <Switch
                  className="w-[50px]"
                  defaultChecked
                  checked={checked}
                  onChange={handleToggleModal}
                />
              </div>

              {/* Amount Field */}
              <div className="flex flex-col ">
                <label
                  htmlFor={`inv`}
                  className="text-[0.75rem] flex justify-between"
                >
                  Invoice Number <span>(optional)</span>
                </label>
                <Field
                  className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2"
                  name={`inv`}
                  value={values.inv}
                />
                <ErrorMessage
                  name={`inv`}
                  component="div"
                  className="text-[12px] font-[400] text-[#f00000]"
                />
              </div>

              {/* end */}

              {/* Amount Field */}
              <div className="flex flex-col ">
                <label htmlFor={`date`} className="text-[0.75rem]">
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

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[0.895rem] font-[600]">Select Item</p>
                </div>

                <FieldArray name="items">
                  {({ remove, push }) => (
                    <div className="flex flex-col gap-4 mt-[16px]">
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
                            <div className="border-b-[1px] pb-[20px] flex flex-col gap-2">
                              <div className="flex flex-col">
                                <div
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  {/* Product Name Field */}
                                  <div>
                                    <label
                                      htmlFor={`items[${index}].id`}
                                      className="text-[0.75rem]"
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
                                      className="text-[12px] font-[400] text-[#f00000]"
                                    />
                                  </div>

                                  {/* Serial Number Field */}
                                  <div className="w-[300px]">
                                    <label
                                      htmlFor={`items[${index}].sn`}
                                      className="text-[0.75rem] w-[300px]"
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
                                      searchPlaceholder="Select Sn"
                                      providedSN={providedSN}
                                    />

                                    <ErrorMessage
                                      name={`items[${index}].sn`}
                                      component="div"
                                      className="text-[12px] font-[400] text-[#f00000]"
                                    />
                                  </div>

                                  {/* Amount Field */}
                                  <div className="flex flex-col mt-2">
                                    <label
                                      htmlFor={`items[${index}].amount`}
                                      className="text-[0.75rem]"
                                    >
                                      Amount
                                    </label>
                                    <Field
                                      className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2"
                                      name={`items[${index}].amount`}
                                      type=""
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
                                      className="text-[12px] font-[400] text-[#f00000]"
                                    />
                                  </div>

                                  {/* Remove Button */}
                                  <img
                                    onClick={() => {
                                      if (values.items.length !== 1) {
                                        remove(index);
                                      }
                                    }}
                                    src="/delete-inv.svg"
                                    alt=""
                                    width={18}
                                    height={18}
                                    className="cursor-pointer mt-6"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col ">
                                <div className="flex items-start gap-2 ">
                                  {/* Amount Paid Field */}
                                  <div>
                                    <label
                                      htmlFor={`items[${index}].amountPaid`}
                                      className="text-[0.75rem]"
                                    >
                                      Amount Paid
                                    </label>
                                    <Field
                                      className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2 w-[190px]"
                                      name={`items[${index}].amountPaid`}
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
                                      className="text-[12px] font-[400] text-[#f00000]"
                                    />
                                  </div>

                                  {/* Serial Number Field */}
                                  <div className="w-[300px]">
                                    <label
                                      htmlFor={`items[${index}].size`}
                                      className="text-[0.75rem] w-[300px]"
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
                                      searchPlaceholder="Select Sze"
                                      productsData={productsData}
                                    />

                                    <ErrorMessage
                                      name={`items[${index}].size`}
                                      component="div"
                                      className="text-[12px] font-[400] text-[#f00000]"
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col mt-2">
                                  <label
                                    htmlFor={`items[${index}].description`}
                                    className="text-[0.75rem]"
                                  >
                                    Description
                                  </label>
                                  <Field
                                    className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2"
                                    disabled
                                    name={`items[${index}].description`}
                                    type=""
                                  />
                                  <ErrorMessage
                                    name={`items[${index}].amount`}
                                    component="div"
                                    className="text-[12px] font-[400] text-[#f00000]"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* Add Item Button */}
                      <button
                        className="cursor-pointer text-[0.75rem] text-[blue]"
                        type="button"
                        onClick={() =>
                          push({
                            id: "",
                            sn: "",
                            amount: 0,
                            amountPaid: 0,
                            product_name: "",
                            size: "",
                          })
                        }
                      >
                        Add Item
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              <Button
                isLoading={addOrderLoading}
                onClick={handleSelectFieldValidation}
              >
                submit
              </Button>
            </Form>
          )}
        </Formik>
      </div>

      <AddCustomer open={isCustomerOpen} setShowDrawer={setIsCustomerOpen} />
    </div>
  );
}

export default AddInvoices;
