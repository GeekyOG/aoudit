import React, { useEffect, useMemo, useState } from "react";
import Container from "../ui/Container";
import { useLazyGetProductsQuery } from "../api/productApi";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import ViewProduct from "../modules/products/ViewProduct";
import { formatAmount } from "../utils/format";
import { Popover, DatePicker, Button } from "antd";
import {
  ListFilter,
  Search,
  Edit,
  Package,
  User,
  ChevronRight,
} from "lucide-react";
import moment from "moment";

// Enhanced ProductDetails Component
interface ProductDetailsProps {
  title: string;
  text: string;
}

function ProductDetails({ title, text }: ProductDetailsProps) {
  return (
    <div className="flex items-start gap-4 text-sm">
      <p className="min-w-[140px] font-semibold text-gray-600">{title}:</p>
      <p className="flex-1 font-medium text-gray-900">{text}</p>
    </div>
  );
}

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
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{productName}</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage product inventory
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              <Search size={18} className="text-gray-400" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-none bg-transparent text-sm outline-none placeholder:text-gray-400 lg:w-64"
                placeholder="Search by vendor name..."
              />
            </div>

            <Popover
              content={
                <div className="flex w-64 flex-col gap-3 p-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Start Date
                    </label>
                    <DatePicker
                      onChange={(date, dateString) =>
                        onChange(date, dateString, "start")
                      }
                      placeholder="Select start date"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      End Date
                    </label>
                    <DatePicker
                      onChange={(date, dateString) =>
                        onChange(date, dateString, "end")
                      }
                      placeholder="Select end date"
                      className="w-full"
                    />
                  </div>

                  <Button className="mt-2 h-9 items-center gap-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700">
                    Apply Filter
                  </Button>
                </div>
              }
              title=""
              placement="bottomLeft"
              showArrow={false}
            >
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-blue-600">
                <ListFilter size={18} />
                Filter
              </button>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {filteredOptions &&
          filteredOptions?.map((item, index) => (
            <div
              className="grid gap-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:grid-cols-2"
              key={index}
            >
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className=" flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Vendor Details
                    </h2>
                  </div>

                  <Link
                    to={`/dashboard/vendors/${item?.vendorId}/products`}
                    className="flex items-center gap-3"
                  >
                    View Details <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  <ProductDetails
                    title="Business name"
                    text={item?.Vendor?.first_name ?? "--"}
                  />
                  <ProductDetails
                    title="Full name"
                    text={item?.Vendor?.last_name ?? "--"}
                  />
                  <ProductDetails
                    title="Phone number"
                    text={`${item.Vendor.phone_number}`}
                  />
                </div>
              </div>

              <div className="border-l border-gray-200 bg-gray-50/50 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <Package size={20} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Product Details
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setProductId(item.id);
                      setProductDialog(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <ProductDetails
                    title="Product name"
                    text={item.product_name}
                  />
                  <ProductDetails
                    title="Description"
                    text={item.description ?? "--"}
                  />
                  <ProductDetails
                    title="Product Amount"
                    text={`${formatAmount(item.purchase_amount)}`}
                  />
                  <ProductDetails
                    title="Sales Amount"
                    text={`${formatAmount(item.sales_price)}`}
                  />
                  <ProductDetails title="Size" text={item.size} />
                  <ProductDetails
                    title="Total Qty Purchased"
                    text={`${item.quantity}`}
                  />
                  <ProductDetails
                    title="Available Quantity"
                    text={`${JSON.parse(item.serial_numbers).length}`}
                  />
                  <ProductDetails
                    title="Purchase Date"
                    text={`${format(new Date(item.date), "dd, MMM, yyyy")}`}
                  />
                </div>

                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-3 text-sm font-semibold text-gray-900">
                        Available Serial Numbers
                      </p>
                      <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
                        {JSON.parse(item.serial_numbers).map(
                          (serialNum, idx) => (
                            <div
                              key={idx}
                              className="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700"
                            >
                              {serialNum}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-semibold text-gray-900">
                        Sold Serial Numbers
                      </p>
                      <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
                        {JSON.parse(item.sold_serial_numbers).map(
                          (serialNum, idx) => (
                            <div
                              key={idx}
                              className="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700"
                            >
                              {serialNum}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        {!filteredOptions &&
          filteredData?.map((item, index) => (
            <div
              className="grid gap-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:grid-cols-2"
              key={index}
            >
              <div className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Vendor Details
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  <ProductDetails
                    title="Business name"
                    text={item.Vendor.first_name}
                  />
                  <ProductDetails
                    title="Full name"
                    text={item.Vendor.last_name ?? "--"}
                  />
                  <ProductDetails
                    title="Phone number"
                    text={`${item.Vendor.phone_number}`}
                  />
                </div>
              </div>

              <div className="border-l border-gray-200 bg-gray-50/50 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <Package size={20} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Product Details
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setProductId(item.id);
                      setProductDialog(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <ProductDetails
                    title="Product name"
                    text={item.product_name}
                  />
                  <ProductDetails
                    title="Description"
                    text={item.description ?? "--"}
                  />
                  <ProductDetails
                    title="Product Amount"
                    text={`${formatAmount(item.purchase_amount)}`}
                  />
                  <ProductDetails
                    title="Sales Amount"
                    text={`${formatAmount(item.sales_price)}`}
                  />
                  <ProductDetails
                    title="Total Qty Purchased"
                    text={`${item.quantity}`}
                  />
                  <ProductDetails
                    title="Available Quantity"
                    text={`${JSON.parse(item.serial_numbers).length}`}
                  />
                  <ProductDetails
                    title="Purchase Date"
                    text={`${format(new Date(item.date), "dd, MMM, yyyy")}`}
                  />
                </div>

                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-900">
                    Serial Numbers
                  </p>
                  <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
                    {JSON.parse(item.serial_numbers).map((serialNum, idx) => (
                      <div
                        key={idx}
                        className="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs text-gray-700"
                      >
                        {serialNum}
                      </div>
                    ))}
                  </div>
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
