import React, { useEffect, useMemo, useState } from "react";
import Container from "../ui/Container";
import { useLazyGetProductsQuery } from "../api/productApi";
import { useParams } from "react-router-dom";
import ProductDetails from "../ui/dashboard/ProductDetails";
import { format } from "date-fns";
import ViewProduct from "../modules/products/ViewProduct";
import { formatAmount } from "../utils/format";
import { Popover, DatePicker, Button } from "antd";
import { ListFilter, Search } from "lucide-react";
import moment from "moment";

function AddItem() {
  const [getProducts, { data: productsData }] = useLazyGetProductsQuery();
  const { productName } = useParams<{ productName: string }>();
  const [filteredData, setFetchedData] = useState<any[]>([]);

  useEffect(() => {
    getProducts("");
  }, []);

  useEffect(() => {
    setFetchedData(
      productsData?.filter((product) => {
        return product.product_name == productName;
      })
    );
  }, [productsData]);

  const [productDialog, setProductDialog] = useState(false);
  const [productId, setProductId] = useState("");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const onChange = (date, dateString, type) => {
    if (type === "start") {
      setStartDate(date ? date.toDate() : null);
    } else {
      setEndDate(date ? date.toDate() : null);
    }
  };

  useEffect(() => {
    let data = productsData?.filter((product) => {
      return product.product_name == productName;
    });
    // Filter by date
    if (startDate && endDate) {
      data = filteredData?.filter((item) => {
        const createdAt = moment(item.date);
        return createdAt.isBetween(startDate, endDate, undefined, "[]");
      });
    }

    setFetchedData(data);
  }, [startDate, endDate]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return filteredData?.filter((item) =>
      item?.Vendor?.first_name
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase())
    );
  }, [filteredData, searchTerm]);

  return (
    <Container>
      <div>
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-[1.45rem] font-[600] text-neutral-500">
              {productName}
            </h1>

            <div className="flex cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by name..."
              />
            </div>

            <Popover
              content={
                <div className="flex flex-col gap-3 px-[4px] py-[16px]">
                  <DatePicker
                    onChange={(date, dateString) =>
                      onChange(date, dateString, "start")
                    }
                    placeholder="Start Date"
                  />
                  <DatePicker
                    onChange={(date, dateString) =>
                      onChange(date, dateString, "end")
                    }
                    placeholder="End Date"
                  />

                  <Button className="items-center text-[#fff] gap-3 bg-[#093aa4] text-[0.865rem]">
                    Apply
                  </Button>
                </div>
              }
              title=""
              placement="bottomLeft"
              showArrow={false}
            >
              <div className="flex cursor-pointer items-center gap-[3px] rounded-md px-[8px] py-[8px] text-neutral-300 hover:text-[#093aa4]">
                <ListFilter size={16} className="" />
                <p className="text-[0.865rem]">Filter</p>
              </div>
            </Popover>
          </div>
        </div>

        <div className="flex flex-col gap-2"></div>
      </div>
      <div className="flex flex-col gap-[8px]">
        {filteredOptions &&
          filteredOptions?.map((item, index) => (
            <div className="flex w-[100%] mt-[24px]" key={index}>
              <div className="w-[50%] border-[1px] p-[24px]">
                <h1 className="text-[1.25rem] font-[600] text-neutral-500">
                  Vendor Details
                </h1>
                <div className="flex flex-col gap-2 mt-[10px]">
                  <ProductDetails
                    title={" Business name"}
                    text={item?.Vendor?.first_name ?? "--"}
                  />
                  <ProductDetails
                    title={" Full name"}
                    text={item?.Vendor?.last_name ?? "--"}
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
                    edit details
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
                    title={"Total Qty Purchased"}
                    text={`${item.quantity}`}
                  />
                  <ProductDetails
                    title={" Purchase Date"}
                    text={`${format(new Date(item.date), "dd, MMM, yyyy")}`}
                  />
                </div>
                <div className="mt-[10px]">
                  <p className="font-[600]">Serial Numbers</p>
                  {JSON.parse(item.serial_numbers).map((item) => (
                    <p className="text-[0.75rem] mt-[8px]">{item}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        {!filteredOptions &&
          filteredData?.map((item, index) => (
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
                    edit details
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
                    title={"Total Qty Purchased"}
                    text={`${item.quantity}`}
                  />
                  <ProductDetails
                    title={" Purchase Date"}
                    text={`${format(new Date(item.date), "dd, MMM, yyyy")}`}
                  />
                </div>
                <div className="mt-[10px]">
                  <p className="font-[600]">Serial Numbers</p>
                  {JSON.parse(item.serial_numbers).map((item) => (
                    <p className="text-[0.75rem] mt-[8px]">{item}</p>
                  ))}
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
