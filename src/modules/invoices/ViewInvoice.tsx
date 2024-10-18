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
import { useLazyGetSerialCodesQuery } from "../../api/serialCodesAPi";
import { toast } from "react-toastify";
import AddCustomer from "../customers/AddCustomer";
import DataLoading from "../../ui/DataLoading";
import SnSelectField from "../../components/input/SnSelectField";
import SizeSelectField from "../../components/input/sizeSlelectField";
import { useLazyGetSubCategoriesQuery } from "../../api/subCategories";
import { useLazyGetMetricsQuery } from "../../api/metrics";

const validationSchema = Yup.object({
  inv: Yup.string(),
  date: Yup.date(),
  items: Yup.array().of(
    Yup.object({
      itemId: Yup.string().required("Item is required"),
      id: Yup.string().required("ID is required"),
      sn: Yup.string().required("required"),
      size: Yup.string().required(" required"),
      amount: Yup.number().required("required").min(1, "Amount cannot be 0"),
      amountPaid: Yup.number()
        .required("required")
        .min(1, "Amount cannot be 0")
        .max(Yup.ref("amount"), "Amount Paid cannot be greater than Amount"),
    })
  ),
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
    // Set the predefined serial number

    if (productId !== "") {
      try {
        // Fetch serial codes based on productName
        const response = result?.filter((item) => item.productId === productId);

        // Set or merge the serial codes fetched
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

  // Adjusted initialValues to prefill the date field
  const initialValues = {
    status: data ? data[0]?.Sale?.status || "" : "",
    customerId: selectedCustomerId || "",
    inv: data ? data[0]?.Sale?.invoiceNumber || "" : "",
    date: data ? formatDate(data[0]?.Sale?.createdAt) : getTodayDate(), // Prefill with sale date or today's date
    items: data?.map((item: any, i) => ({
      itemId: item.id || "",
      id: item.productId || "",
      sn: item.serial_number || "",
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
    <div>
      <div>
        {isLoading && (
          <div>
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
                    getOrder(id);
                    toast.success("Successfully Updated");
                    setDialogOpen(false);
                    getMetric("");
                    getOrders("");
                  })
                  .catch((error) => {
                    toast.error(error.data.message ?? "Something went wrong.");
                  });
            }}
          >
            {({ values, setFieldValue }) => (
              <Form className="flex flex-col gap-[15px]">
                <div className="flex-col">
                  <p className="text-[0.895rem] font-[600]">Status</p>
                  <Field
                    className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2 max-w-[200px]"
                    as="select"
                    name={`status`}
                  >
                    <option value="">Select an option</option>
                    {["pending", "completed", "returned", "borrowed"].map(
                      (option, i) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      )
                    )}
                  </Field>
                </div>
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
                    <p className="text-[0.895rem] font-[600]">Items</p>
                  </div>

                  <FieldArray name="items">
                    {({ remove, push }) => (
                      <div className="flex flex-col gap-4 mt-[16px]">
                        {values.items.length > 0 &&
                          values.items.map((item, index) => {
                            const providedSN = {
                              serial_number: item?.sn,
                              productId: item?.productId,
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
                                      <Field
                                        className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2 max-w-[200px] h-[46px]"
                                        as="select"
                                        name={`items[${index}].id`}
                                        value={values.items[index].id}
                                        onChange={(e) => {
                                          const selectedProduct =
                                            productsData?.find(
                                              (item) =>
                                                item.id == e.target.value
                                            );
                                          setFieldValue(
                                            `items[${index}].id`,
                                            selectedProduct?.id
                                          );

                                          fetchSerialCodes(
                                            selectedProduct?.id || "",
                                            index
                                          );
                                        }}
                                      >
                                        <option value="">
                                          Select an option
                                        </option>
                                        {productsData
                                          ?.filter(
                                            (product, index, self) =>
                                              index ===
                                              self.findIndex(
                                                (p) =>
                                                  p.product_name ===
                                                  product.product_name
                                              )
                                          )
                                          .map((option) => (
                                            <option
                                              key={option.id}
                                              value={option.id}
                                            >
                                              {option.product_name}
                                            </option>
                                          ))}
                                      </Field>

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
                                        providedSN={providedSN}
                                        searchPlaceholder="Select Sn"
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
                                        type="number"
                                        step="0.01"
                                        value={values.items[index].amount}
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
                                          setFieldValue(
                                            `items[${index}].sn`,
                                            ""
                                          );

                                          setFieldValue(
                                            `items[${index}].id`,
                                            ""
                                          );

                                          setFieldValue(
                                            `items[${index}].size`,
                                            ""
                                          );
                                          remove(index);
                                          console.log(values.items);
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
                                        type="number"
                                        step="1"
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
                                        searchPlaceholder="Select Size"
                                        productsData={productsData}
                                        providedSN={providedSize}
                                      />

                                      <ErrorMessage
                                        name={`items[${index}].size`}
                                        component="div"
                                        className="text-[12px] font-[400] text-[#f00000]"
                                      />
                                    </div>
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
                          Add Item
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>

                <Button
                  isLoading={updateLoading}
                  onClick={handleSelectFieldValidation}
                >
                  submit
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </div>

      <AddCustomer open={isCustomerOpen} setShowDrawer={setIsCustomerOpen} />
    </div>
  );
}

export default ViewInvoice;
