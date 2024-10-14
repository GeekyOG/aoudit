import React, { useEffect, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Container from "../ui/Container";
import Button from "../ui/Button";
import AddProductModal from "../modules/products/AddProductModal";
import { ListFilter, Search } from "lucide-react";
import { cn } from "../utils/cn";
import { useLazyGetAllProductsByVendorIdQuery } from "../api/productApi";

import { useParams } from "react-router-dom";
import { columns } from "../modules/products/vendorColumns";
import DataLoading from "../ui/DataLoading";
import { Popover, DatePicker } from "antd";
import moment from "moment";
import { useLazyGetSupplierQuery } from "../api/vendorApi";

const Tabs = ["All Products"];

function VendorsProducts() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { id } = useParams<{ id: string }>();

  const [getProduct, { isLoading: productsLoading, data: productsData }] =
    useLazyGetAllProductsByVendorIdQuery();

  useEffect(() => {
    getProduct(id);
  }, [getProduct]);

  const [activeTab, setActiveTab] = useState(Tabs[0]);

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleGetProducts = () => {
    getProduct("");
  };
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const onChange = (date, dateString, type) => {
    if (type === "start") {
      setStartDate(date ? date.toDate() : null);
    } else {
      setEndDate(date ? date.toDate() : null);
    }
  };
  const [fetchedData, setFetchedData] = useState<any[]>([]);

  const [getSupplier, { data: supplierData, isLoading: SupplierLoading }] =
    useLazyGetSupplierQuery();

  useEffect(() => {
    if (id) {
      getSupplier(id);
    }
  }, [id]);

  useEffect(() => {
    let filteredData = productsData;
    // Filter by date
    if (startDate && endDate) {
      filteredData = productsData?.filter((item) => {
        const createdAt = moment(item.createdAt);
        return createdAt.isBetween(startDate, endDate, undefined, "[]");
      });
    }

    setFetchedData(filteredData);
  }, [endDate, startDate, productsData]);

  return (
    <div>
      {SupplierLoading && (
        <div className="flex items-center justify-center h-[80vh]">
          <DataLoading />
        </div>
      )}
      {!SupplierLoading && supplierData && (
        <>
          <div>
            <Container>
              <h1 className="text-[1.45rem] font-[700] text-neutral-500">
                Vendor Details
              </h1>

              <div className="flex flex-col gap-6 border-b-[1px] pb-[16px] mt-[24px] text-[0.865rem]">
                <div className="flex gap-[16px]">
                  <p className="text-neutral-400 font-[600] w-[120px]">
                    Business Name:
                  </p>
                  <p>{supplierData.first_name}</p>
                </div>
                <div className="flex gap-[16px]">
                  <p className="text-neutral-400 font-[600] w-[120px]">
                    Full Name:
                  </p>
                  <p>{supplierData.last_name}</p>
                </div>
                <div className="flex gap-[16px]">
                  <p className="text-neutral-400 font-[600] w-[120px]">
                    Email Address:
                  </p>
                  <p>{supplierData?.email}</p>
                </div>
                <div className="flex gap-[16px]">
                  <p className="text-neutral-400 font-[600] w-[120px]">
                    Phone Number:
                  </p>
                  <p>{supplierData?.phone_number}</p>
                </div>
              </div>
            </Container>
            <Container className="py-[20px]">
              <h1 className="text-[1.35rem] font-[700] text-neutral-500">
                Purchase History
              </h1>
            </Container>

            <Container className="flex items-center justify-between">
              <div className="flex gap-[5px]">
                {Tabs.map((tab, i) => (
                  <div
                    onClick={() => handleActiveTab(tab)}
                    key={i}
                    className={cn(
                      "border-[1px] px-[15px] py-[8px] text-[0.865rem] cursor-pointer",
                      tab === activeTab && "font-[600] text-secondary-600"
                    )}
                  >
                    <p>{tab}</p>
                  </div>
                ))}
              </div>

              <div className="mb-[3px] flex items-center gap-[8px]">
                <div className="flex cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
                  <Search size={16} className="text-neutral-300" />
                  <input
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

                      <Button className="items-center gap-3 bg-[#093aa4] text-[0.865rem]">
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
                {activeTab === "Products" && (
                  <Button
                    onClick={() => setShowAddProduct(true)}
                    className="rounded-0 flex h-[36px] items-center text-[0.865rem]"
                  >
                    Add Product
                  </Button>
                )}
              </div>
            </Container>
          </div>
          <Container>
            <DashboardTable
              type="product"
              action={""}
              columns={columns}
              data={fetchedData || []}
              isFetching={productsLoading}
              callBackAction={handleGetProducts}
            />
          </Container>

          {showAddProduct && (
            <AddProductModal setShowAddProduct={setShowAddProduct} />
          )}
        </>
      )}
    </div>
  );
}

export default VendorsProducts;
