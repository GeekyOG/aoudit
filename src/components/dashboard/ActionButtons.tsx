import React, { useRef, useState } from "react";
import TableActionButtons from "../../ui/dashboard/TableActionButtons";
import AddCategory from "../../modules/products/AddCategoryDrawer";
import AddCustomer from "../../modules/customers/AddCustomer";
import DialogContainer from "../../ui/dashboard/Modal";
import { useDeleteCustomerMutation } from "../../api/customerApi";
import { toast } from "react-toastify";
import AddVendor from "../../modules/vendors/AddVendor";
import { useDeleteSupplierMutation } from "../../api/vendorApi";
import { useDeleteCategoryMutation } from "../../api/categoriesApi";
import { useDeleteSubCategoryMutation } from "../../api/subCategories";
import AddSubCategory from "../../modules/products/AddSubCategory";
import { useDeleteProductMutation } from "../../api/productApi";
import ViewProduct from "../../modules/products/ViewProduct";
import AddUser from "../../modules/users/AddUser";
import { useDeleteAdminUserMutation } from "../../api/adminUsers";
import {
  useDeleteOrderMutation,
  useLazyGetOrdersQuery,
} from "../../api/ordersApi";
import InvoiceModal from "../../modules/invoices/InvoiceModal";
import InvoiceDetails from "../../modules/invoices/InvoiceDetails";
import { X } from "lucide-react";
import { handleDownload } from "../../utils/export";
import Button from "../../ui/Button";
import { useNavigate } from "react-router-dom";

interface ActionButtonsProps {
  id: string;
  type: string;
  action: any;
  callBackAction?: any;
}

function ActionButtons({
  id,
  type,
  action,
  callBackAction,
}: ActionButtonsProps) {
  const [showCustomer, setShowCustomer] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const [showVendor, setShowVendor] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [productDialog, setProductDialog] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");

  const handleDeleteCustomerDialog = () => {
    setShowDialog(true);
    setDialogTitle("Delete customer Permanently");
    setDialogContent(
      "Deleting this customer, this customer would would not longer be displayed on your website. Please note this action cannot be undone"
    );
  };

  const [deleteCustomer, { isLoading }] = useDeleteCustomerMutation();

  const handleDeleteCustomer = () => {
    deleteCustomer(id)
      .unwrap()
      .then(() => {
        toast.success("Action Successful");
        callBackAction();
      })
      .catch((err) => toast.error(err.body.error ?? "Something went wrong"));
  };

  const [deleteSupplier, { isLoading: supplierLoading }] =
    useDeleteSupplierMutation();

  const handleDeleteSupplierDialog = () => {
    setShowDialog(true);
    setDialogTitle("Delete Supplier Permanently");
    setDialogContent(
      "Deleting this Supplier, this Supplier would would not longer be displayed on your website. Please note this action cannot be undone"
    );
  };

  const handleDeleteVendor = () => {
    deleteSupplier(id)
      .unwrap()
      .then(() => {
        toast.success("Action Successful");
        callBackAction();
      })
      .catch((err) => toast.error(err.body.error ?? "Something went wrong"));
  };

  const [deleteCategory, { isLoading: categoryLoading }] =
    useDeleteCategoryMutation();

  const handleDeleteCategoryDialog = () => {
    setShowDialog(true);
    setDialogTitle("Delete Category Permanently");
    setDialogContent(
      "Deleting this Category, this Category would would not longer be displayed on your website. Please note this action cannot be undone"
    );
  };

  const handleDeleteCategory = () => {
    deleteCategory(id)
      .unwrap()
      .then(() => {
        toast.success("Action Successful");
        callBackAction();
      })
      .catch((err) => toast.error(err.body.error ?? "Something went wrong"));
  };

  const [deleteSubCategory, { isLoading: SubcategoryLoading }] =
    useDeleteSubCategoryMutation();

  const handleDeleteSubCategoryDialog = () => {
    setShowDialog(true);
    setDialogTitle("Delete SubCategory Permanently");
    setDialogContent(
      "Deleting this SubCategory, this SubCategory would would not longer be displayed on your website. Please note this action cannot be undone"
    );
  };

  const handleDeleteSubCategory = () => {
    deleteSubCategory(id)
      .unwrap()
      .then(() => {
        toast.success("Action Successful");
        callBackAction();
      })
      .catch((err) => toast.error(err.body.error ?? "Something went wrong"));
  };

  const [deleteProduct, { isLoading: deleteProductLoading }] =
    useDeleteProductMutation();

  const handleDeleteProductDialog = () => {
    setShowDialog(true);
    setDialogTitle("Delete Product Permanently");
    setDialogContent(
      "Deleting this Product, this Product would would not longer be displayed on your website. Please note this action cannot be undone"
    );
  };

  const handleDeleteProduct = () => {
    deleteProduct(id)
      .unwrap()
      .then(() => {
        toast.success("Action Successful");
        callBackAction();
      })
      .catch((err) => toast.error(err.body.error ?? "Something went wrong"));
  };

  const handleDeleteUser = () => {
    deleteUser(id)
      .unwrap()
      .then(() => {
        toast.success("Action Successful");
        callBackAction();
      });
  };

  const [deleteUser, { isLoading: deleteUserLoading }] =
    useDeleteAdminUserMutation();
  const handleDeleteUserDialog = () => {
    setShowDialog(true);
    setDialogTitle("Delete User Permanently");
    setDialogContent(
      "Deleting this User, this User would would not longer be displayed on your website. Please note this action cannot be undone"
    );
  };

  const [showInvoice, setShowInvoice] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [getOrders] = useLazyGetOrdersQuery();
  const [deleteOrder, { isLoading: deleteOrderLoading }] =
    useDeleteOrderMutation();

  const handleDeleteOrder = () => {
    deleteOrder(id)
      .unwrap()
      .then(() => {
        toast.success("Action Successful");
        getOrders("");
      });
  };

  const handleDeleteOrderDialog = () => {
    setShowDialog(true);
    setDialogTitle("Delete Order Permanently");
    setDialogContent(
      "Deleting this Order, this Order would would not longer be displayed on your website. Please note this action cannot be undone"
    );
  };

  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadInvoice = () => handleDownload(pdfRef);

  const navigate = useNavigate();

  return (
    <>
      {type == "inventory" && (
        <>
          {" "}
          <TableActionButtons
            setShow={() => {
              navigate(`/dashboard/product/${id}/`);
            }}
          />
        </>
      )}
      {type === "customers" && (
        <>
          <TableActionButtons
            setShow={() => {
              navigate(`/dashboard/customers/${id}/orders`);
            }}
            handleEdit={() => {
              setShowCustomer(true);
            }}
            handleDelete={() => {
              handleDeleteCustomerDialog();
            }}
          />

          {showCustomer && (
            <AddCustomer
              id={id}
              open={showCustomer}
              setShowDrawer={setShowCustomer}
            />
          )}
        </>
      )}

      {type === "users" && (
        <>
          <TableActionButtons
            handleEdit={() => {
              setShowUser(true);
            }}
            handleDelete={() => {
              handleDeleteUserDialog();
            }}
          />

          {showUser && (
            <AddUser id={id} open={showUser} setShowDrawer={setShowUser} />
          )}
        </>
      )}

      {type === "vendors" && (
        <>
          <TableActionButtons
            setShow={() => {
              navigate(`/dashboard/vendors/${id}/products`);
            }}
            handleEdit={() => {
              setShowVendor(true);
            }}
            handleDelete={() => {
              handleDeleteSupplierDialog();
            }}
          />

          {showVendor && (
            <AddVendor
              id={id}
              open={showVendor}
              setShowDrawer={setShowVendor}
            />
          )}
        </>
      )}

      {type === "category" && (
        <>
          <TableActionButtons
            handleEdit={() => {
              setShowCategory(true);
            }}
            handleDelete={() => {
              handleDeleteCategoryDialog();
            }}
          />

          {showCategory && (
            <AddCategory
              id={id}
              open={showCategory}
              setShowDrawer={setShowCategory}
            />
          )}
        </>
      )}

      {type === "subcategory" && (
        <>
          <TableActionButtons
            handleEdit={() => {
              setShowSubCategory(true);
            }}
            handleDelete={() => {
              handleDeleteSubCategoryDialog();
            }}
          />

          {showSubCategory && (
            <AddSubCategory
              id={id}
              open={showSubCategory}
              setShowDrawer={setShowSubCategory}
            />
          )}
        </>
      )}

      {type === "orders" && (
        <>
          <TableActionButtons
            setShow={() => {
              setShowInvoiceDetails(true);
            }}
            handleEdit={() => {
              setShowInvoice(true);
            }}
            handleDelete={() => {
              handleDeleteOrderDialog();
            }}
          />
          {showInvoiceDetails && (
            <div className="fixed z-[100] top-0 right-0 left-0 min-h-[100vh] overflow-y-scroll  pt-[100px]">
              <div className="absolute left-0 right-0 top-0 z-[50] min-h-[100vh] overflow-y-scroll bg-[#00000065] px-[28px] pt-[48px] pb-[28px]">
                <div className=" mx-auto max-w-[500px] py-6 bg-[#000]">
                  <div className="flex justify-end gap-4">
                    <Button
                      className=" bg-[#a40909]"
                      onClick={handleDownloadInvoice}
                    >
                      Download
                    </Button>
                    <button
                      className="p-[12px] rounded-[50%]  bg-[#e3e3e3]"
                      onClick={() => setShowInvoiceDetails(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div ref={pdfRef}>
                    <InvoiceDetails id={id} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {showInvoice && (
            <div className="fixed z-[100] top-0 right-0 left-0 min-h-[100vh] overflow-y-scroll">
              <InvoiceModal
                id={id}
                view={true}
                setDialogOpen={setShowInvoice}
              />
            </div>
          )}
        </>
      )}

      {type === "product" && (
        <>
          <TableActionButtons
            handleEdit={() => {
              setProductDialog(true);
            }}
            handleDelete={() => {
              handleDeleteProductDialog();
            }}
          />
          {productDialog && (
            <ViewProduct id={id} setShowAddProduct={setProductDialog} />
          )}
        </>
      )}

      {showDialog && (
        <DialogContainer
          setDialogOpen={setShowDialog}
          title={dialogTitle}
          btnText={"Delete"}
          description={dialogContent}
          action={
            (type == "customers" && handleDeleteCustomer) ||
            (type == "vendors" && handleDeleteVendor) ||
            (type == "category" && handleDeleteCategory) ||
            (type == "subcategory" && handleDeleteSubCategory) ||
            (type == "product" && handleDeleteProduct) ||
            (type == "users" && handleDeleteUser) ||
            (type == "orders" && handleDeleteOrder) ||
            function (): void {
              throw new Error("Function not implemented.");
            }
          }
          type={"delete"}
          image={"/delete.svg"}
          isLoading={
            isLoading ||
            supplierLoading ||
            categoryLoading ||
            SubcategoryLoading ||
            deleteProductLoading ||
            deleteUserLoading ||
            deleteOrderLoading
          }
        />
      )}
    </>
  );
}

export default ActionButtons;
