import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Container from "../ui/Container";
import Button from "../ui/Button";
import AddProductModal from "../modules/products/AddProductModal";
import { columns } from "../modules/products/columns";
import { Search } from "lucide-react";
import { useLazyGetCategoriesQuery } from "../api/categoriesApi";
import { cn } from "../utils/cn";
import { categoryColumns } from "../modules/products/categoryColumns";
import { subCategoryColumns } from "../modules/products/subCategoryColumns";
import { useLazyGetProductsQuery } from "../api/productApi";
import { useLazyGetSubCategoriesQuery } from "../api/subCategories";
import AddCategory from "../modules/products/AddCategoryDrawer";
import AddSubCategory from "../modules/products/AddSubCategory";

const Tabs = ["Products"];

function Inventory() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showSubCategory, setShowSubCategory] = useState(false);

  const [
    getSubCategories,
    { isLoading: subCategoryLoading, data: subCategoryData },
  ] = useLazyGetSubCategoriesQuery();

  const [getCategories, { isLoading: categoryLoading, data: categoryData }] =
    useLazyGetCategoriesQuery();

  useEffect(() => {
    getCategories("");
  }, [getCategories]);

  useEffect(() => {
    getSubCategories("");
  }, [getSubCategories]);

  const [getProduct, { isLoading: productsLoading, data: productsData }] =
    useLazyGetProductsQuery();

  useEffect(() => {
    getProduct("");
  }, [getProduct]);

  const [activeTab, setActiveTab] = useState(Tabs[0]);

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleGetCategories = () => {
    getCategories("");
  };

  const handleGetProducts = () => {
    getProduct("");
  };

  const handleGetSubCategories = () => {
    getSubCategories("");
  };

  const result = productsData?.reduce((acc, product) => {
    const serialNumbers = JSON.parse(product.serial_numbers).length;

    // Create a unique key based on product name and size
    const productKey = `${product.product_name}-${product.size}`;

    // Check if the combination of product name and size already exists in the accumulator
    if (!acc[productKey]) {
      acc[productKey] = {
        product_name: product.product_name,
        size: product.size,
        total_serial_numbers: serialNumbers,
        createdAt: product.createdAt,
      };
    } else {
      // If it exists, add to the total serial numbers
      acc[productKey].total_serial_numbers += serialNumbers;
    }

    return acc;
  }, {});

  // Convert the result object back to an array
  const uniqueProducts: any[] = Object.values(result ?? []);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return uniqueProducts?.filter((item) =>
      item?.product_name?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }, [uniqueProducts, searchTerm]);

  return (
    <div>
      <div>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by name..."
              />
            </div>
            {activeTab === "Products" && (
              <Button
                onClick={() => setShowAddProduct(true)}
                className="rounded-0 flex h-[36px] items-center text-[0.865rem]"
              >
                Add Product
              </Button>
            )}
            {activeTab === "Size" && (
              <Button
                onClick={() => setShowCategory(true)}
                className="rounded-0 flex h-[36px] items-center text-[0.865rem]"
              >
                Add Size
              </Button>
            )}

            {activeTab === "Colors" && (
              <Button
                onClick={() => setShowSubCategory(true)}
                className="rounded-0 flex h-[36px] items-center text-[0.865rem]"
              >
                Add Color
              </Button>
            )}
          </div>
        </Container>
      </div>
      <Container>
        {activeTab === "Products" && (
          <DashboardTable
            type="inventory"
            action={() => {}}
            columns={columns}
            data={filteredOptions || uniqueProducts || []}
            isFetching={productsLoading}
            callBackAction={handleGetProducts}
          />
        )}
        {activeTab === "Colors" && (
          <DashboardTable
            type="category"
            action={getCategories}
            columns={categoryColumns}
            data={categoryData || []}
            isFetching={categoryLoading}
            callBackAction={handleGetCategories}
          />
        )}
        {activeTab === "Size" && (
          <DashboardTable
            type="subcategory"
            action={getSubCategories}
            columns={subCategoryColumns}
            data={subCategoryData || []}
            isFetching={subCategoryLoading}
            callBackAction={handleGetSubCategories}
          />
        )}
      </Container>
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
