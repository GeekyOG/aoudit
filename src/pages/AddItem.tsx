import React, { useEffect, useState } from "react";
import Container from "../ui/Container";
import { useLazyGetProductsQuery } from "../api/productApi";
import { useParams } from "react-router-dom";
import ProductDetails from "../ui/dashboard/ProductDetails";
import { format } from "date-fns";
import ViewProduct from "../modules/products/ViewProduct";
import { formatAmount } from "../utils/format";

function AddItem() {
  const [getProducts, { data: productsData }] = useLazyGetProductsQuery();
  const { productName } = useParams<{ productName: string }>();

  useEffect(() => {
    getProducts("");
  }, []);

  const filteredData = productsData?.filter((product) => {
    return product.product_name == productName;
  });

  const [productDialog, setProductDialog] = useState(false);
  const [productId, setProductId] = useState("");

  console.log(filteredData);

  return (
    <Container>
      <div>
        <h1 className="text-[1.45rem] font-[600] text-neutral-500">
          {productName}
        </h1>
        <div className="flex flex-col gap-2"></div>
      </div>
      <div className="flex flex-col gap-[8px]">
        {filteredData?.map((item, index) => (
          <div className="flex w-[100%] mt-[24px]" key={index}>
            <div className="w-[50%] border-[1px] p-[24px]">
              <h1 className="text-[1.25rem] font-[600] text-neutral-500">
                Vendor Details
              </h1>
              <div className="flex flex-col gap-2 mt-[10px]">
                <ProductDetails
                  title={" Business name"}
                  text={item.Vendor.first_name}
                />
                <ProductDetails
                  title={" Full name"}
                  text={item.Vendor.last_name ?? "--"}
                />
                <ProductDetails
                  title={" Phone number"}
                  text={`${item.Vendor.phone_number}`}
                />
              </div>
            </div>
            <div className="w-[50%] border-[1px] p-[24px]">
              <div className="flex justify-between">
                <h1 className="text-[1.25rem] font-[600] text-neutral-500">
                  Product Details
                </h1>
                <button
                  onClick={() => {
                    setProductId(item.id);
                    setProductDialog(true);
                  }}
                  className="bg-[#000] text-neutral p-[6px]"
                >
                  view details
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-[10px]">
                <ProductDetails
                  title={" Product name"}
                  text={item.product_name}
                />
                <ProductDetails
                  title={" Product Amount"}
                  text={`${formatAmount(item.purchase_amount)}`}
                />
                <ProductDetails
                  title={" Sales Amount"}
                  text={`${formatAmount(item.sales_price)}`}
                />
                <ProductDetails
                  title={" Purchase Date"}
                  text={`${format(new Date(item.createdAt), "dd, MMM, yyyy")}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {productDialog && (
        <ViewProduct id={productId} setShowAddProduct={setProductDialog} />
      )}
    </Container>
  );
}

export default AddItem;
