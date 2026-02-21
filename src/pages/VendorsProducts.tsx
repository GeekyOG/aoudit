import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Container from "../ui/Container";
import Button from "../ui/Button";
import AddProductModal from "../modules/products/AddProductModal";
import {
  Building2,
  ListFilter,
  Mail,
  Package,
  Phone,
  Search,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useLazyGetAllProductsByVendorIdQuery } from "../api/productApi";
import { useParams } from "react-router-dom";
import { columns } from "../modules/products/vendorColumns";
import DataLoading from "../ui/DataLoading";
import { Popover, DatePicker } from "antd";
import moment from "moment";
import { useLazyGetSupplierQuery } from "../api/vendorApi";
import { formatAmount } from "../utils/format";

const Tabs = ["All Products"];

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

interface Product {
  purchase_amount: number;
  quantity: number;
  [key: string]: any;
}

function VendorsProducts() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { id } = useParams<{ id: string }>();

  const [getProduct, { isLoading: productsLoading, data: productsData }] =
    useLazyGetAllProductsByVendorIdQuery();
  const [getSupplier, { data: supplierData, isLoading: SupplierLoading }] =
    useLazyGetSupplierQuery();

  useEffect(() => {
    getProduct(id);
  }, [getProduct]);
  useEffect(() => {
    if (id) getSupplier(id);
  }, [id]);

  const [activeTab, setActiveTab] = useState(Tabs[0]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const onChange = (date: any, _: any, type: string) => {
    if (type === "start") setStartDate(date ? date.toDate() : null);
    else setEndDate(date ? date.toDate() : null);
  };

  const filteredOptions = useMemo(() => {
    return productsData?.filter((item: any) =>
      item?.product_name?.toLowerCase().includes(searchTerm?.toLowerCase()),
    );
  }, [productsData, searchTerm]);

  useEffect(() => {
    let filtered = productsData;
    if (startDate && endDate) {
      filtered = filtered?.filter((p: any) =>
        moment(p.date).isBetween(startDate, endDate, undefined, "[]"),
      );
    }
    if (searchTerm) {
      filtered = filtered?.filter((p: any) =>
        p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredProducts(filtered);
  }, [productsData, startDate, endDate, searchTerm]);

  const totalPurchaseAmount =
    filteredProducts?.reduce(
      (sum, item) => sum + item.purchase_amount * item.quantity,
      0,
    ) || 0;

  const vendorName = supplierData?.first_name ?? "";

  return (
    <div className="min-h-screen bg-gray-50/50">
      {SupplierLoading && (
        <div className="flex items-center justify-center h-[80vh]">
          <DataLoading />
        </div>
      )}

      {!SupplierLoading && supplierData && (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
          {/* Vendor Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400" />
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div
                  className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0",
                    getAvatarColor(vendorName),
                  )}
                >
                  {getInitials(vendorName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">
                        {vendorName}
                      </h1>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {supplierData?.last_name}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      Vendor
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {supplierData?.email && (
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail size={13} className="text-gray-400" />
                        {supplierData.email}
                      </span>
                    )}
                    {supplierData?.phone_number && (
                      <span className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone size={13} className="text-gray-400" />
                        {supplierData.phone_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Total Purchase Value
                </p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">
                  {formatAmount(totalPurchaseAmount)}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Package size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Total Products
                </p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">
                  {filteredProducts?.length ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              {/* Tabs */}
              <div className="flex gap-1">
                {Tabs.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                      tab === activeTab
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 transition-colors">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-40"
                    placeholder="Search products..."
                  />
                </div>

                {/* Filter */}
                <Popover
                  content={
                    <div className="flex flex-col gap-3 p-3 w-[220px]">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Filter by Date
                      </p>
                      <DatePicker
                        onChange={(date, dateString) =>
                          onChange(date, dateString, "start")
                        }
                        placeholder="Start Date"
                        className="rounded-lg"
                      />
                      <DatePicker
                        onChange={(date, dateString) =>
                          onChange(date, dateString, "end")
                        }
                        placeholder="End Date"
                        className="rounded-lg"
                      />
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm rounded-lg">
                        Apply Filter
                      </Button>
                    </div>
                  }
                  placement="bottomRight"
                  showArrow={false}
                  trigger="click"
                >
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                    <ListFilter size={14} />
                    Filter
                  </button>
                </Popover>

                {activeTab === "Products" && (
                  <Button
                    onClick={() => setShowAddProduct(true)}
                    className="flex items-center gap-2 text-sm rounded-xl h-9 px-4 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Product
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <DashboardTable
              type="product"
              action={""}
              columns={columns}
              data={filteredProducts || filteredOptions || []}
              isFetching={productsLoading}
              callBackAction={() => getProduct("")}
            />
          </div>
        </div>
      )}

      {showAddProduct && (
        <AddProductModal setShowAddProduct={setShowAddProduct} />
      )}
    </div>
  );
}

export default VendorsProducts;
