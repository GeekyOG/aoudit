import { Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useLazyGetOrdersQuery,
  useLazySearchBySerialNumberQuery,
} from "../../api/ordersApi";
import DataLoading from "../../ui/DataLoading";
import ProductDetails from "../../ui/dashboard/ProductDetails";
import { format } from "date-fns";
import { cn } from "../../utils/cn";
import { useLazyGetProductsQuery } from "../../api/productApi";
import { useNavigate } from "react-router-dom";
import ViewProduct from "../../modules/products/ViewProduct";
import { formatAmount } from "../../utils/format";

function SearchModal() {
  const [searchBySerialNumber, { data, isFetching }] =
    useLazySearchBySerialNumberQuery();
  const [searchValue, setSearchValue] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [getOrders, { data: ordersData, isError, isSuccess }] =
    useLazyGetOrdersQuery();

  const [getProduct, { isFetching: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  useEffect(() => {
    getOrders("");
    getProduct("");
  }, []);

  const optionsRef = useRef<HTMLDivElement>(null);

  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      optionsRef.current &&
      !optionsRef.current.contains(event.target as Node)
    ) {
      setShowSearch(false);
      setShowSuggestion(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const salesResult = ordersData?.map((order) => ({
    serial_number: order.serial_number,
    productId: order.productId,
  }));

  const result = productsData?.flatMap((product) =>
    JSON.parse(product.serial_numbers).map((serial_number) => ({
      serial_number,
      productId: product.id,
    }))
  );

  const handleSearch = () => {
    if (searchValue !== "") {
      setShowSearch(true);
      searchBySerialNumber(searchValue.trim());

      setSearchValue("");
    }
  };

  const filteredOptions = useMemo(() => {
    if (result && salesResult) {
      return [...result, ...salesResult]?.filter((item) =>
        item.serial_number.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
  }, [result, searchValue]);

  const [productDialog, setProductDialog] = useState(false);

  const navigate = useNavigate();

  const [id, setId] = useState("");

  useEffect(() => {
    if (data?.product) {
      setId(data.product.id);
    }
  }, [data]);

  return (
    <div>
      <div className="mb-[16px] flex">
        <div className="relative">
          <div className="flex">
            <input
              value={searchValue}
              className="border-[1px] rounded-[4px] py-[8px] px-[8px]"
              placeholder="Search by serial number"
              onChange={(e) => {
                setShowSuggestion(true);
                setSearchValue(e.target.value);
              }}
            />
            <button className="bg-[#000] px-[12px]" onClick={handleSearch}>
              <Search className="text-neutral-50" />
            </button>
          </div>

          {filteredOptions && showSuggestion && (
            <div
              className="bg-[#fff] shadow-lg p-[14px] absolute w-[100%] z-[10]"
              ref={optionsRef}
            >
              {filteredOptions?.map((value, index) => (
                <div
                  className="border-b-[1px] py-[8px] cursor-pointer"
                  key={index}
                  onClick={() => setSearchValue(value.serial_number)}
                >
                  <p>{value.serial_number}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showSearch && (
        <div
          ref={optionsRef}
          className="fixed z-[80] top-0 bottom-0 overflow-y-scroll right-0 left-0 bg-[#0000005f]"
        >
          <div className="bg-[#fff] rounded-[8px] max-w-[800px] mx-auto mt-[50px] p-[32px] min-h-[400px]">
            <button
              className="bg-[#000] text-[#fff] px-[16px] "
              onClick={() => setShowSearch(false)}
            >
              close
            </button>
            {isFetching && (
              <div className="h-[400px] flex justify-center items-center">
                <DataLoading />
              </div>
            )}
            {!isFetching && data && (
              <div>
                {data?.product && (
                  <div className="mt-[20px]">
                    <div className="flex gap-4 items-end">
                      <div>
                        <p className="text-[1.25rem] font-[600]">
                          Item Details
                        </p>
                        <p className="text-[0.865rem] bg-secondary-600 p-[6px] max-w-[150px]">
                          {data.saleItem?.Sale.status == "borrowed" &&
                            "Item borrowed"}
                          {data.saleItem?.Sale.status == "completed" &&
                            "Item Sold"}

                          {data.saleItem?.Sale.status == "pending" &&
                            "Item pending payment"}

                          {data.saleItem?.Sale.status != "borrowed" &&
                            data.saleItem?.Sale.status !== "completed" &&
                            data.saleItem?.Sale.status !== "pending" &&
                            "Item in store"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setProductDialog(true);
                        }}
                        className="bg-[#000] text-neutral p-[6px]"
                      >
                        view details
                      </button>
                    </div>

                    <div className="mt-[20px]">
                      <div className="flex flex-col gap-2">
                        <ProductDetails
                          title={" Product name"}
                          text={data.product.product_name}
                        />
                        <ProductDetails
                          title={" Product Amount"}
                          text={`${formatAmount(data.product.purchase_amount)}`}
                        />
                        <ProductDetails
                          title={" Sales Amount"}
                          text={`${formatAmount(data.product.sales_price)}`}
                        />
                        <ProductDetails
                          title={" Purchase Date"}
                          text={`${format(new Date(data.product.createdAt), "dd, MMM, yyyy")}`}
                        />
                      </div>
                      <div className="flex gap-4 items-end">
                        <p className="text-[1rem] font-[600] mt-[20px]">
                          Vendor Details
                        </p>

                        <button
                          onClick={() => {
                            navigate(
                              `vendors/${data?.product.Vendor?.id}/products`
                            );
                          }}
                          className="bg-[#000] text-neutral p-[6px]"
                        >
                          view details
                        </button>
                      </div>

                      <div className="mt-[14px]">
                        <div className="flex flex-col gap-2">
                          <ProductDetails
                            title={" Business name"}
                            text={data.product.Vendor.first_name}
                          />
                          <ProductDetails
                            title={" Full Name"}
                            text={`${data.product.Vendor.last_name}`}
                          />
                          <ProductDetails
                            title={"Phone Number"}
                            text={`${data.product.Vendor.phone_number}`}
                          />
                          <ProductDetails
                            title={"Email Address"}
                            text={`${data.product.Vendor.email}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {data?.saleItem && (
                  <div className="mt-[20px]">
                    <div className="flex gap-4 items-end">
                      <div>
                        <p className="text-[1.25rem] font-[600]">
                          Item Details
                        </p>
                        <p className="text-[0.865rem] bg-secondary-600 p-[6px] max-w-[150px]">
                          {data.saleItem?.Sale.status == "borrowed" &&
                            "Item borrowed"}
                          {data.saleItem?.Sale.status == "completed" &&
                            "Item Sold"}

                          {data.saleItem?.Sale.status == "pending" &&
                            "Item pending payment"}

                          {data.saleItem?.Sale.status != "borrowed" &&
                            data.saleItem?.Sale.status !== "completed" &&
                            data.saleItem?.Sale.status !== "pending" &&
                            "Item in store"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setProductDialog(true);
                        }}
                        className="bg-[#000] text-neutral p-[6px]"
                      >
                        view details
                      </button>
                    </div>

                    <p
                      className={cn(
                        "text-[0.865rem]  p-[6px] max-w-[130px] text-[#000] mt-[12px]",
                        data.saleItem?.Sale.status == "completed"
                          ? "bg-green-300"
                          : "bg-secondary-550"
                      )}
                    >
                      Status: {data.saleItem?.Sale.status}
                    </p>

                    <div className="mt-[20px]">
                      <div className="flex flex-col gap-2">
                        <ProductDetails
                          title={" Product name"}
                          text={data.saleItem.Product.product_name}
                        />
                        <ProductDetails
                          title={" Product Amount"}
                          text={`${formatAmount(data.saleItem.amount)}`}
                        />
                        <ProductDetails
                          title={" Sales Amount"}
                          text={`${formatAmount(data.saleItem.amount_paid)}`}
                        />
                      </div>

                      <p className="text-[1rem] font-[600] mt-[20px]">
                        Vendor Details
                      </p>

                      <div className="mt-[14px]">
                        <div className="flex flex-col gap-2">
                          <ProductDetails
                            title={" Business name"}
                            text={data.saleItem.Product.Vendor.first_name}
                          />
                          <ProductDetails
                            title={" Full Name"}
                            text={`${data.saleItem.Product.Vendor.last_name}`}
                          />
                          <ProductDetails
                            title={"Phone Number"}
                            text={`${data.saleItem.Product.Vendor.phone_number}`}
                          />
                          <ProductDetails
                            title={"Email Address"}
                            text={`${data.saleItem.Product.Vendor.email}`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 items-end">
                        <p className="text-[1rem] font-[600] mt-[20px]">
                          Customer Details
                        </p>

                        <button
                          // onClick={() => {
                          //   navigate(`vendors/${data?.saleItem?.Vendor?.id}/products`);
                          // }}
                          className="bg-[#000] text-neutral p-[6px]"
                        >
                          view details
                        </button>
                      </div>

                      <div className="mt-[14px]">
                        <div className="flex flex-col gap-2">
                          <ProductDetails
                            title={" Business name"}
                            text={data.saleItem.Sale.Customer.first_name}
                          />
                          <ProductDetails
                            title={" Full Name"}
                            text={`${data.saleItem.Sale.Customer.last_name}`}
                          />
                          <ProductDetails
                            title={"Phone Number"}
                            text={`${data.saleItem.Sale.Customer.phone_number}`}
                          />
                          <ProductDetails
                            title={"Email Address"}
                            text={`${data.saleItem.Sale.Customer.email}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {productDialog && (
        <ViewProduct
          id={data.saleItem ? data?.saleItem?.productId : data.product.id}
          setShowAddProduct={setProductDialog}
        />
      )}
    </div>
  );
}

export default SearchModal;
