import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Button from "../../ui/Button";
import {
  useGetProductQuery,
  useLazyGetProductsQuery,
} from "../../api/productApi";
import SelectField from "../../components/input/SelectField";
import { useGetCustomerQuery } from "../../api/customerApi";
import * as Yup from "yup";
import {
  useAddOrderMutation,
  useGetOrderQuery,
  useLazyGetOrderQuery,
  useLazyGetOrdersQuery,
  useUpdateOrderMutation,
} from "../../api/ordersApi";
import { useLazyGetSerialCodesQuery } from "../../api/serialCodesAPi";
import { toast } from "react-toastify";
import AddCustomer from "../customers/AddCustomer";
import DataLoading from "../../ui/DataLoading";

// Validation schema for form validation
const validationSchema = Yup.object({
  items: Yup.array()
    .of(
      Yup.object({
        itemId: Yup.string().required("Item is required"),
        id: Yup.string().required("Item is required"),
        sn: Yup.string().required("SN is required"),
        amount: Yup.number()
          .required("Amount is required")
          .min(1, "Amount cannot be 0"),
        amountPaid: Yup.number()
          .required("Amount Paid is required")
          .min(1, "Amount cannot be 0"),
      })
    )
    .min(1, "At least one item is required"),
});

interface ViewInvoiceProps {
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  id: string;
}

function ViewInvoice({ setDialogOpen, id }: ViewInvoiceProps) {
  const [getProducts, { isFetching: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  const [getOrder, { data, isLoading }] = useLazyGetOrderQuery();

  useEffect(() => {
    getOrder(id);
  }, []);
  const [getSerialCodes, { data: serialCodeData }] =
    useLazyGetSerialCodesQuery();
  const [getOrders] = useLazyGetOrdersQuery();
  const [selectedCustomer, setSelectedCustomer] = useState("Select an option");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerError, setSelectedCustomerError] = useState(false);

  const handleSelectFieldValidation = () => {
    if (selectedCustomer === "Select an option") {
      setSelectedCustomerError(true);
      return false;
    } else {
      setSelectedCustomerError(false);
      return true;
    }
  };

  const { isFetching: customerLoading, data: customerData } =
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
            : response.filter(
                (serial) => !selectedSn.includes(serial.serial_number)
              ) || [],
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

  const initialValues = {
    status: data ? data[0]?.Sale?.status || "" : "",
    customerId: selectedCustomerId || "",
    items: data?.map((item: any, i) => ({
      itemId: item.id || "",
      id: item.productId || "",
      sn: item.serial_number || "",
      amount: item.amount || 0,
      amountPaid: item.amount_paid || 0,
    })) || [{ id: "", sn: "", amount: 0, amountPaid: 0 }],
  };
  console.log(initialValues);

  useEffect(() => {
    data?.map((item, index) => {
      fetchSerialCodes(item?.Product?.id || "", index);
    });
  }, [data]);

  const [selectedSn, setSelectedSerialNumbers] = useState<any>([]);

  const handleSerialNumberChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
    setFieldValue: Function
  ) => {
    const newSerialNumber = e.target.value;
    const selectedCode = serialCodesForProducts[index]?.find(
      (item) => item.serial_number === e.target.value
    );

    // Add the new serial number to the selected list
    if (selectedCode) {
      setSelectedSerialNumbers((prevSelected) => [
        ...prevSelected,
        newSerialNumber,
      ]);

      // Set the product ID and serial number
      setFieldValue(`items[${index}].id`, selectedCode.productId);
      setFieldValue(`items[${index}].sn`, selectedCode.serial_number);

      // Update the amount with the selected product's sales price
      const selectedProduct = productsData.find(
        (product) => product.id === selectedCode.productId
      );
      setFieldValue(
        `items[${index}].amount`,
        selectedProduct?.sales_price || 0
      );
    }
  };

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
            onSubmit={(values) => {
              const valid = handleSelectFieldValidation();

              updateOrder({
                id: id,
                status: values.status,
                customerId: selectedCustomerId,
                items: values.items.map((item) => ({
                  id: item.itemId,
                  productId: item.id,
                  serial_number: item.sn,
                  amount: item.amount,
                  amount_paid: item.amountPaid,
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

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[0.895rem] font-[600]">Items</p>
                  </div>

                  <FieldArray name="items">
                    {({ remove, push }) => (
                      <div className="flex flex-col gap-2 mt-[16px]">
                        {values.items.length > 0 &&
                          values.items.map((item, index) => (
                            <div key={index} className="flex gap-2 ">
                              <div>
                                <label
                                  htmlFor={`items[${index}].id`}
                                  className="text-[0.75rem]"
                                >
                                  Product Name
                                </label>
                                <Field
                                  className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2 max-w-[200px]"
                                  as="select"
                                  name={`items[${index}].id`}
                                  value={values.items[index].id}
                                  onChange={(e) => {
                                    const selectedProduct = productsData?.find(
                                      (item) => item.id == e.target.value
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
                                  <option value="">Select an option</option>

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
                                      <option key={option.id} value={option.id}>
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

                              <div>
                                <label
                                  htmlFor={`items[${index}].sn`}
                                  className="text-[0.75rem]"
                                >
                                  Serial Number
                                </label>
                                <Field
                                  className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2 max-w-[200px]"
                                  as="select"
                                  name={`items[${index}].sn`}
                                  onChange={(e) => {
                                    handleSerialNumberChange(
                                      e,
                                      index,
                                      setFieldValue
                                    );
                                  }}
                                >
                                  <option value="">Select an option</option>
                                  <option value={data[index]?.serial_number}>
                                    {data[index]?.serial_number}
                                  </option>
                                  {serialCodesForProducts[index]?.map(
                                    (option, i) => (
                                      <option
                                        key={i}
                                        value={option.serial_number}
                                      >
                                        {option.serial_number}
                                      </option>
                                    )
                                  )}
                                </Field>
                                <ErrorMessage
                                  name={`items[${index}].sn`}
                                  component="div"
                                  className="text-[12px] font-[400] text-[#f00000]"
                                />
                              </div>

                              <div>
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
                                  step="10"
                                />
                                <ErrorMessage
                                  name={`items[${index}].amount`}
                                  component="div"
                                  className="text-[12px] font-[400] text-[#f00000]"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`items[${index}].amountPaid`}
                                  className="text-[0.75rem]"
                                >
                                  Amount Paid
                                </label>
                                <Field
                                  className="border-[1px] rounded-[4px] py-3 text-[0.75rem] outline-none px-2"
                                  name={`items[${index}].amountPaid`}
                                  type="number"
                                  step="10"
                                />
                                <ErrorMessage
                                  name={`items[${index}].amountPaid`}
                                  component="div"
                                  className="text-[12px] font-[400] text-[#f00000]"
                                />
                              </div>

                              <img
                                onClick={() => {
                                  if (values.items.length !== 1) {
                                    setSelectedSerialNumbers((prevSelected) =>
                                      prevSelected.filter(
                                        (serialNumber) =>
                                          serialNumber !==
                                          values.items[index].sn
                                      )
                                    );
                                    remove(index);
                                  }
                                }}
                                src="/delete-inv.svg"
                                alt=""
                                width={18}
                                height={18}
                                className="cursor-pointer"
                              />
                            </div>
                          ))}

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
