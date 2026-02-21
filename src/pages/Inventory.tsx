import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Button from "../ui/Button";
import AddProductModal from "../modules/products/AddProductModal";
import { columns } from "../modules/products/columns";
import { Package, Palette, Ruler, Plus, Search } from "lucide-react";
import { useLazyGetCategoriesQuery } from "../api/categoriesApi";
import { cn } from "../utils/cn";
import { categoryColumns } from "../modules/products/categoryColumns";
import { subCategoryColumns } from "../modules/products/subCategoryColumns";
import { useLazyGetProductsQuery } from "../api/productApi";
import { useLazyGetSubCategoriesQuery } from "../api/subCategories";
import AddCategory from "../modules/products/AddCategoryDrawer";
import AddSubCategory from "../modules/products/AddSubCategory";
import moment from "moment";

const Tabs = [
  { key: "Products", icon: <Package size={14} /> },
  { key: "Size", icon: <Ruler size={14} /> },
];

const TAB_STYLES: Record<string, string> = {
  Products:
    "data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700 data-[active=true]:border-indigo-200",
  Size: "data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 data-[active=true]:border-amber-200",
  Colors:
    "data-[active=true]:bg-rose-50 data-[active=true]:text-rose-700 data-[active=true]:border-rose-200",
};

const PAGE_META: Record<
  string,
  { icon: React.ReactNode; iconBg: string; label: string }
> = {
  Products: {
    icon: <Package size={17} />,
    iconBg: "bg-indigo-50 text-indigo-600",
    label: "Inventory",
  },
  Size: {
    icon: <Ruler size={17} />,
    iconBg: "bg-amber-50 text-amber-600",
    label: "Sizes",
  },
  Colors: {
    icon: <Palette size={17} />,
    iconBg: "bg-rose-50 text-rose-600",
    label: "Colors",
  },
};

function Inventory() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [activeTab, setActiveTab] = useState("Products");
  const [searchTerm, setSearchTerm] = useState("");

  const [
    getSubCategories,
    { isLoading: subCategoryLoading, data: subCategoryData },
  ] = useLazyGetSubCategoriesQuery();
  const [getCategories, { isLoading: categoryLoading, data: categoryData }] =
    useLazyGetCategoriesQuery();
  const [getProduct, { isLoading: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  useEffect(() => {
    getCategories("");
  }, [getCategories]);
  useEffect(() => {
    getSubCategories("");
  }, [getSubCategories]);
  useEffect(() => {
    getProduct("");
  }, [getProduct]);

  const result = productsData?.reduce((acc: any, product: any) => {
    const serialNumbers = JSON.parse(product.serial_numbers).length;
    const productKey = `${product.product_name}`;
    if (!acc[productKey]) {
      acc[productKey] = {
        product_name: product.product_name,
        size: product.size,
        addedBy: product.addedBy,
        description: product.description,
        total_serial_numbers: serialNumbers,
        createdAt: product.date,
      };
    } else {
      acc[productKey].total_serial_numbers += serialNumbers;
    }
    return acc;
  }, {});

  const uniqueProducts: any[] = Object.values(
    Object.values(result ?? []).sort((a: any, b: any) =>
      moment(b.createdAt).isBefore(a.createdAt) ? -1 : 1,
    ),
  );

  const filteredOptions = useMemo(
    () =>
      uniqueProducts?.filter((item) =>
        item?.product_name?.toLowerCase().includes(searchTerm?.toLowerCase()),
      ),
    [uniqueProducts, searchTerm],
  );

  const meta = PAGE_META[activeTab];

  const handleAddAction = () => {
    if (activeTab === "Products") setShowAddProduct(true);
    if (activeTab === "Size") setShowCategory(true);
    if (activeTab === "Colors") setShowSubCategory(true);
  };

  const addLabel = {
    Products: "Add Product",
    Size: "Add Size",
    Colors: "Add Color",
  }[activeTab];

  const recordCount =
    activeTab === "Products"
      ? (filteredOptions || uniqueProducts).length
      : activeTab === "Colors"
        ? (categoryData?.length ?? 0)
        : (subCategoryData?.length ?? 0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center",
                meta.iconBg,
              )}
            >
              {meta.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{meta.label}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {recordCount} record{recordCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            onClick={handleAddAction}
            className="flex items-center gap-2 text-sm rounded-xl h-9 px-4 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={15} />
            {addLabel}
          </Button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            {/* Tabs */}
            <div className="flex gap-1">
              {Tabs.map(({ key, icon }) => (
                <button
                  key={key}
                  data-active={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    "border-transparent text-gray-500 hover:bg-gray-50",
                    TAB_STYLES[key],
                  )}
                >
                  {icon}
                  {key}
                </button>
              ))}
            </div>

            {/* Search (only for Products) */}
            {activeTab === "Products" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-44"
                  placeholder="Search by name..."
                />
              </div>
            )}
          </div>

          {/* Table */}
          {activeTab === "Products" && (
            <DashboardTable
              type="inventory"
              action={() => {}}
              columns={columns}
              data={filteredOptions || uniqueProducts || []}
              isFetching={productsLoading}
              callBackAction={() => getProduct("")}
            />
          )}
          {activeTab === "Colors" && (
            <DashboardTable
              type="category"
              action={getCategories}
              columns={categoryColumns}
              data={categoryData || []}
              isFetching={categoryLoading}
              callBackAction={() => getCategories("")}
            />
          )}
          {activeTab === "Size" && (
            <DashboardTable
              type="subcategory"
              action={getSubCategories}
              columns={subCategoryColumns}
              data={subCategoryData || []}
              isFetching={subCategoryLoading}
              callBackAction={() => getSubCategories("")}
            />
          )}
        </div>
      </div>

      <AddCategory open={showCategory} setShowDrawer={setShowCategory} />
      <AddSubCategory
        open={showSubCategory}
        setShowDrawer={setShowSubCategory}
      />
      {showAddProduct && (
        <AddProductModal setShowAddProduct={setShowAddProduct} />
      )}
    </div>
  );
}

export default Inventory;
