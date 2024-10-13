import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "../../ui/Button";
import { useLazyGetProductsQuery } from "../../api/productApi";
import SelectField from "../../components/input/SelectField";
import {
  useGetCustomerQuery,
  useLazyGetCustomersQuery,
} from "../../api/customerApi";
import * as Yup from "yup";
import {
  useAddOrderMutation,
  useLazyGetOrdersQuery,
} from "../../api/ordersApi";
import { useLazyGetSerialCodesQuery } from "../../api/serialCodesAPi";
import { toast } from "react-toastify";
import AddCustomer from "../customers/AddCustomer";
import SnSelectField from "../../components/input/SnSelectField";

// Validation schema for form validation
const validationSchema = Yup.object({
  items: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().optional(),
        id: Yup.string().required("Item is required"),
        sn: Yup.string().required("SN is required"),
        amount: Yup.number()
          .required("Amount is required")
          .min(1, "Amount cannot be 0"),
        amountPaid: Yup.number()
          .required("Amount Paid is required")
          .min(1, "Amount cannot be 0")
          .max(Yup.ref("amount"), "Amount Paid cannot be greater than Amount"),
      })
    )
    .min(1, "At least one item is required"),
});

interface AddInvoicesProps {
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

function AddInvoices({ setDialogOpen }: AddInvoicesProps) {
  const [getProduct, { isFetching: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();
  const [getOrders] = useLazyGetOrdersQuery();
  const [getSerialCodes] = useLazyGetSerialCodesQuery();

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
    }))
  );

  const fetchSerialCodes = async (productId: string, index: number) => {
    if (productId) {
      const response = result?.filter((item) => item.productId === productId);
      setSerialCodesForProducts((prevState) => {
        return {
          ...prevState,
          [index]:
            response.filter(
              (serial) => !selectedSn.includes(serial.serial_number)
            ) || [],
        };
      });
    }
  };

  useEffect(() => {
    getProduct("");
  }, []);

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
        <Formik
          initialValues={{
            customerId: "",
            items: [{ id: "", sn: "", amount: 0, amountPaid: 0 }],
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const valid = handleSelectFieldValidation();

            addOrder({
              customerId: selectedCustomerId,
              items: values.items.map((item) => ({
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
                toast.success("Sale added successfully");
                setDialogOpen(false);
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
                <div className="flex items-center justify-between">
                  <p className="text-[0.895rem] font-[600]">Select Item</p>
                </div>

                <FieldArray name="items">
                  {({ remove, push }) => (
                    <div className="flex flex-col gap-2 mt-[16px]">
                      {values.items.length > 0 &&
                        values.items.map((item, index) => (
                          <div key={index} className="flex items-end gap-2">
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
                                name={`items[${index}].name`}
                                onChange={(e) => {
                                  const selectedProduct = productsData?.find(
                                    (product) => product.id == e.target.value
                                  );

                                  // Set the selected product's ID and amount (pre-fill)
                                  setFieldValue(
                                    `items[${index}].id`,
                                    selectedProduct?.id
                                  );
                                  setFieldValue(
                                    `items[${index}].amount`,
                                    selectedProduct?.sales_price || 0 // Pre-fill amount with product's sales_price
                                  );

                                  // Fetch serial numbers for the selected product
                                  fetchSerialCodes(
                                    selectedProduct?.id || "",
                                    index
                                  );

                                  // Store the product name separately to display it even after ID changes
                                  setFieldValue(
                                    `items[${index}].product_name`,
                                    selectedProduct?.product_name
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

                            {/* Serial Number Field */}
                            <div className="w-[300px]">
                              <label
                                htmlFor={`items[${index}].sn`}
                                className="text-[0.75rem] w-[300px]"
                              >
                                Serial Number
                              </label>
                              <SnSelectField
                                serialCodesForProducts={serialCodesForProducts}
                                snIndex={index}
                                values={values}
                                setFieldValue={setFieldValue}
                                options={serialCodesForProducts[index]}
                                productsData={productsData}
                                setSelectedSerialNumbers={
                                  setSelectedSerialNumbers
                                }
                              />
                              {/* <Field
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
                              </Field> */}
                              <ErrorMessage
                                name={`items[${index}].sn`}
                                component="div"
                                className="text-[12px] font-[400] text-[#f00000]"
                              />
                            </div>

                            {/* Amount Field */}
                            <div className="flex flex-col">
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

                            {/* Amount Paid Field */}
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
                                step="1"
                              />
                              <ErrorMessage
                                name={`items[${index}].amountPaid`}
                                component="div"
                                className="text-[12px] font-[400] text-[#f00000]"
                              />
                            </div>

                            {/* Remove Button */}
                            <img
                              onClick={() => {
                                if (values.items.length !== 1) {
                                  setSelectedSerialNumbers((prevSelected) =>
                                    prevSelected.filter(
                                      (serialNumber) =>
                                        serialNumber !== values.items[index].sn
                                    )
                                  );
                                  remove(index);
                                }
                              }}
                              src="/delete-inv.svg"
                              alt=""
                              width={18}
                              height={18}
                              className="cursor-pointer mb-3"
                            />
                          </div>
                        ))}

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
