import {
  Search,
  X,
  Package,
  User,
  Building2,
  Phone,
  Mail,
  Tag,
  ShoppingCart,
  HandCoins,
  Eye,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useLazyGetOrdersQuery,
  useLazySearchBySerialNumberQuery,
} from "../../api/ordersApi";
import DataLoading from "../../ui/DataLoading";
import { format } from "date-fns";
import { cn } from "../../utils/cn";
import { useLazyGetProductsQuery } from "../../api/productApi";
import { useNavigate } from "react-router-dom";
import ViewProduct from "../../modules/products/ViewProduct";
import { formatAmount } from "../../utils/format";
import InvoiceModal from "../../modules/invoices/InvoiceModal";
import { useLazyGetAllSalesQuery } from "../../api/metrics";
import BorrowInvoiceModal from "../../modules/invoices/BorrowInvoiceModal";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  completed: {
    label: "Item Sold",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Pending Payment",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  borrowed: {
    label: "Item Borrowed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  returned: {
    label: "Item Returned",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  in_store: {
    label: "In Store",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

const getStatusStyle = (status?: string) =>
  STATUS_STYLES[status ?? "in_store"] ?? STATUS_STYLES["in_store"];

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs font-medium text-gray-400 w-32 shrink-0 pt-0.5">
      {label}
    </span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

const SectionCard = ({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="rounded-xl border border-gray-100 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
      </div>
      {action}
    </div>
    <div className="px-4 py-1">{children}</div>
  </div>
);

function SearchModal() {
  const [searchBySerialNumber, { data, isFetching }] =
    useLazySearchBySerialNumberQuery();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [open, setOpen] = useState(false);
  const [openBorrowed, setOpenBorrowed] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [id, setId] = useState("");

  const navigate = useNavigate();
  const optionsRef = useRef<HTMLDivElement>(null);

  const [getOrders, { data: ordersData }] = useLazyGetAllSalesQuery();
  const [getProduct, { data: productsData }] = useLazyGetProductsQuery();

  useEffect(() => {
    getProduct("");
  }, []);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(searchValue), 300);
    return () => clearTimeout(handler);
  }, [searchValue]);
  useEffect(() => {
    getOrders({ search: debouncedValue });
  }, [debouncedValue]);
  useEffect(() => {
    if (data?.product) setId(data.product.id);
  }, [data]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestion(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const salesResult = ordersData?.map((order: any) => ({
    serial_number: order.serial_number,
    productId: order.productId,
  }));

  const result = productsData?.flatMap((product: any) =>
    JSON.parse(product.serial_numbers).map((serial_number: string) => ({
      serial_number,
      productId: product.id,
    })),
  );

  const filteredOptions = useMemo(() => {
    if (result && salesResult) {
      return [...result, ...salesResult]?.filter((item: any) =>
        item.serial_number.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }
  }, [result, salesResult, searchValue]);

  const isSold = JSON.parse(data?.product?.serial_numbers ?? "[]").includes(
    searchValue,
  );

  const handleSearch = () => {
    if (searchValue.trim()) {
      setShowSearch(true);
      setShowSuggestion(false);
      searchBySerialNumber(searchValue.trim());
    }
  };

  const productPayload = {
    sn: searchValue,
    description: data?.saleItem
      ? data.saleItem.description
      : data?.product?.description,
    size: data?.saleItem ? data.saleItem.size : data?.product?.size,
    id: data?.saleItem ? data.saleItem.productId : data?.product?.id,
  };

  // Determine the status to display
  const saleStatus = data?.saleItem?.Sale?.status;
  const isInStore = !!data?.product;
  const statusKey = isInStore ? "in_store" : saleStatus;
  const statusStyle = getStatusStyle(statusKey);

  return (
    <div className="mb-5">
      {/* Search Bar */}
      <div className="relative" ref={optionsRef}>
        <div className="flex items-center gap-0 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all w-full max-w-md">
          <Search size={16} className="text-gray-400 ml-3 shrink-0" />
          <input
            value={searchValue}
            className="flex-1 py-2.5 px-3 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            placeholder="Search by serial number..."
            onChange={(e) => {
              setShowSuggestion(true);
              setSearchValue(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            Search
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {filteredOptions &&
          showSuggestion &&
          filteredOptions.length > 0 &&
          searchValue && (
            <div className="absolute top-full mt-1.5 left-0 w-full max-w-md bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden">
              {filteredOptions.slice(0, 8).map((value: any, index: number) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  onClick={() => {
                    setSearchValue(value.serial_number);
                    setShowSuggestion(false);
                  }}
                >
                  <Tag size={13} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">
                    {value.serial_number}
                  </span>
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Results Modal */}
      {showSearch && (
        <div className="fixed z-[80] inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-16 px-4 pb-8 overflow-y-auto">
          <div
            className="bg-white rounded-2xl w-full max-w-[680px] shadow-2xl overflow-hidden"
            style={{ animation: "slideUp 0.25s ease-out" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Search size={15} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-900">
                    Search Results
                  </h2>
                  <p className="text-xs text-gray-400">
                    Serial:{" "}
                    <span className="font-mono text-gray-600">
                      {searchValue}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6">
              {isFetching && (
                <div className="h-48 flex justify-center items-center">
                  <DataLoading />
                </div>
              )}

              {!isFetching && data && (
                <div className="space-y-4">
                  {/* Status & Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <span
                      className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-full border",
                        statusStyle.className,
                      )}
                    >
                      {statusStyle.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setProductDialog(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        <Eye size={13} /> View Details
                      </button>
                      {(isInStore || saleStatus === "returned") && (
                        <button
                          onClick={() => setOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-medium text-white transition-all"
                        >
                          <ShoppingCart size={13} /> Sell Item
                        </button>
                      )}
                      {isInStore && (
                        <button
                          onClick={() => setOpenBorrowed(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white transition-all"
                        >
                          <HandCoins size={13} /> Borrow Item
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  {(data.product || data.saleItem) &&
                    (() => {
                      const product = data.product ?? data.saleItem?.Product;
                      const vendor =
                        product?.Vendor ?? data.saleItem?.Product?.Vendor;
                      const saleAmount = data.saleItem?.amount;
                      const amountPaid = data.saleItem?.amount_paid;

                      return (
                        <>
                          <SectionCard
                            title="Product Details"
                            icon={<Package size={15} />}
                          >
                            <InfoRow
                              label="Product Name"
                              value={product?.product_name ?? "—"}
                            />
                            <InfoRow
                              label="Purchase Amount"
                              value={formatAmount(
                                product?.purchase_amount ?? saleAmount,
                              )}
                            />
                            <InfoRow
                              label={
                                data.saleItem ? "Amount Paid" : "Sales Price"
                              }
                              value={formatAmount(
                                data.saleItem
                                  ? amountPaid
                                  : product?.sales_price,
                              )}
                            />
                            {data.product && (
                              <InfoRow
                                label="Purchase Date"
                                value={format(
                                  new Date(data.product.createdAt),
                                  "dd MMM yyyy",
                                )}
                              />
                            )}
                          </SectionCard>

                          {vendor && (
                            <SectionCard
                              title="Vendor Details"
                              icon={<Building2 size={15} />}
                              action={
                                <button
                                  onClick={() =>
                                    navigate(`vendors/${vendor.id}/products`)
                                  }
                                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                  View vendor →
                                </button>
                              }
                            >
                              <InfoRow
                                label="Business Name"
                                value={vendor.first_name ?? "—"}
                              />
                              <InfoRow
                                label="Full Name"
                                value={vendor.last_name ?? "—"}
                              />
                              <InfoRow
                                label="Phone"
                                value={vendor.phone_number ?? "—"}
                              />
                              <InfoRow
                                label="Email"
                                value={vendor.email ?? "—"}
                              />
                            </SectionCard>
                          )}

                          {data.saleItem?.Sale?.Customer && !isSold && (
                            <SectionCard
                              title="Customer Details"
                              icon={<User size={15} />}
                            >
                              <InfoRow
                                label="First Name"
                                value={
                                  data.saleItem.Sale.Customer.first_name ?? "—"
                                }
                              />
                              <InfoRow
                                label="Last Name"
                                value={
                                  data.saleItem.Sale.Customer.last_name ?? "—"
                                }
                              />
                              <InfoRow
                                label="Phone"
                                value={
                                  data.saleItem.Sale.Customer.phone_number ??
                                  "—"
                                }
                              />
                              <InfoRow
                                label="Email"
                                value={data.saleItem.Sale.Customer.email ?? "—"}
                              />
                            </SectionCard>
                          )}
                        </>
                      );
                    })()}
                </div>
              )}

              {!isFetching && !data && (
                <div className="text-center py-12">
                  <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Search size={22} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No results found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try a different serial number
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {productDialog && (
        <ViewProduct
          id={data?.saleItem ? data.saleItem.productId : data?.product?.id}
          setShowAddProduct={setProductDialog}
        />
      )}
      {openBorrowed && (
        <BorrowInvoiceModal
          setDialogOpen={setOpenBorrowed}
          {...productPayload}
        />
      )}
      {open && <InvoiceModal setDialogOpen={setOpen} {...productPayload} />}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default SearchModal;
