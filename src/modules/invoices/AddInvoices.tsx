import { Drawer } from "antd";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import Input from "../../components/input/Input";
import Button from "../../ui/Button";
import { IoIosAdd } from "react-icons/io";
import AddCustomer from "../customers/AddCustomer";
import AddProductModal from "../products/AddProductModal";
import { useLazyGetProductsQuery } from "../../api/productApi";
import SelectField from "../../components/input/SelectField";

interface AddInvoicesProps {
  open: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

function AddInvoices({ open, setShowDrawer }: AddInvoicesProps) {
  const onClose = () => {
    setShowDrawer(false);
  };

  const [getProduct, { isFetching: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  useEffect(() => {
    getProduct("");
  }, []);

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("Select an option");
  const [productId, setProductId] = useState("");
  const [selectedProductError, setSelectedProductError] = useState(false);

  const [isCustomerOpen, setIsCustomerOpen] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const product = productsData?.find((item) => item.id === productId);

    if (product) {
      setSelectedProducts((prevSelected: any[]) => {
        const existingProduct = prevSelected.find(
          (selected: { id: string }) => selected.id === product.id
        );

        if (existingProduct) {
          return prevSelected.map((selected: { id: string; count: number }) =>
            selected.id === product.id
              ? { ...selected, count: selected.count + 1 }
              : selected
          );
        } else {
          return [...prevSelected, { ...product, count: 1 }];
        }
      });
    }
  }, [productId]);
  return (
    <Drawer title="Add Invoice" onClose={onClose} open={open}>
      <div>
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
          }}
          onSubmit={() => {}}
        >
          {({ errors, touched }) => (
            <Form className="flex flex-col gap-[15px]">
              <div>
                <Input
                  title="Select Customer"
                  name="firstName"
                  placeholder="Enter your first name"
                  errors={errors.firstName}
                  touched={touched.firstName}
                  width="max-h-[40px] w-[100%]"
                  smallTitle={true}
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
                  <p className="text-[0.75rem] font-[600]">Select Item</p>
                </div>
                {selectedProducts.length > 0 && (
                  <div className="flex flex-col gap-[12px]">
                    {selectedProducts.map((product: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between border-b-[1px] pb-[12.5px]"
                      >
                        <div>
                          <p className="text-[0.813rem]">{product?.name}</p>
                          <p className="text-[0.688rem] text-[#667085]">
                            {product.count} x ₦{product?.salesPrice}
                          </p>
                        </div>

                        <div className="flex items-center gap-[24px]">
                          <div>
                            <p className="text-[0.813rem]">
                              ₦{" "}
                              {parseFloat(product.count) *
                                parseFloat(product?.salesPrice)}
                            </p>
                            <p className="text-[0.688rem] text-[#667085]">
                              (Excluding 14% Tax rate)
                            </p>
                          </div>
                          <img
                            src="/delete-inv.svg"
                            alt=""
                            width={18}
                            height={18}
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedProducts(
                                selectedProducts.filter(
                                  (p: any, index: number) => index !== i
                                )
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <SelectField
                  searchPlaceholder="Enter  Product name"
                  className="w-[100%]"
                  title=""
                  error={selectedProductError}
                  selected={selectedProduct}
                  setId={setProductId}
                  setSelected={setSelectedProduct}
                  isLoading={productsLoading}
                  options={productsData || []}
                />
                <p
                  className="cursor-pointer text-[0.75rem] text-[blue]"
                  onClick={() => setShowAddProduct(true)}
                >
                  Add Product
                </p>
              </div>

              <Input
                title="Amount"
                name="firstName"
                placeholder="Enter your first name"
                errors={errors.firstName}
                touched={touched.firstName}
                width="max-h-[40px] w-[100%]"
                smallTitle={true}
              />

              <Input
                title="Amount Paid"
                name="firstName"
                placeholder="Enter your first name"
                errors={errors.firstName}
                touched={touched.firstName}
                width="max-h-[40px] w-[100%]"
                smallTitle={true}
              />
              <Button className="h-[56px]">submit</Button>
            </Form>
          )}
        </Formik>
      </div>
      {showAddProduct && (
        <AddProductModal setShowAddProduct={setShowAddProduct} />
      )}
      <AddCustomer open={isCustomerOpen} setShowDrawer={setIsCustomerOpen} />
    </Drawer>
  );
}

export default AddInvoices;
