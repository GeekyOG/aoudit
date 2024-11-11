import { Drawer } from "antd";
import { Field, Form, Formik } from "formik";
import React, { useEffect } from "react";
import Input from "../../components/input/Input";
import Button from "../../ui/Button";
import { useLazyGetRolesQuery } from "../../api/rolesApi";

import { toast } from "react-toastify";
import {
  useAddExpenseMutation,
  useLazyGetExpenseQuery,
  useUpdateExpenseMutation,
} from "../../api/expensesApi";

interface AddExpenseProps {
  id?: string;
  open: boolean;
  setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

function AddExpense({ open, setShowDrawer, id }: AddExpenseProps) {
  const [getRoles, { data: roles, isFetching, isError }] =
    useLazyGetRolesQuery();

  const [getExpenses] = useLazyGetExpenseQuery();

  const [addExpense, { isLoading }] = useAddExpenseMutation();

  useEffect(() => {
    getRoles("");
  }, []);

  const [getExpense, { data: expensesData }] = useLazyGetExpenseQuery();
  const [updateExpense] = useUpdateExpenseMutation();
  useEffect(() => {
    if (id) {
      getExpense(id);
    }
  }, []);

  const onClose = () => {
    setShowDrawer(false);
  };

  const userData = JSON.parse(localStorage.getItem("user") ?? "");

  return (
    <Drawer title="Add User" onClose={onClose} open={open}>
      <div>
        <Formik
          initialValues={{
            spentOn: expensesData?.spentOn ?? "",
            amount: expensesData?.amount ?? "",
            addedBy: `${userData.firstname} ${userData.lastname}`,
            date: new Date(expensesData?.date) ?? "",
            id: "",
          }}
          enableReinitialize={true}
          onSubmit={(values) => {
            values.id = id ?? "";
            if (id) {
              updateExpense(values)
                .unwrap()
                .then(() => {
                  toast.success("Action successful");
                  getExpenses("");
                  onClose();
                })
                .catch((error) => {
                  toast.error(error.data.message);
                });
            } else {
              addExpense(values)
                .unwrap()
                .then(() => {
                  toast.success("Action successful");
                  getExpenses("");
                  onClose();
                })
                .catch((error) => {
                  toast.error(error.data.message);
                });
            }
          }}
        >
          {({ errors, touched }) => (
            <Form className="flex flex-col gap-[15px]">
              <Input
                title="Description"
                name="spentOn"
                placeholder="Enter your expense description"
                errors={errors.spentOn}
                touched={touched.spentOn}
              />
              <Input
                title="Amount"
                name="amount"
                type="number"
                placeholder="Enter Amount"
                errors={errors.amount}
                touched={touched.amount}
              />
              <Input
                title="Date"
                type="date"
                name="date"
                placeholder="Enter Date"
                errors={errors.date}
                touched={touched.date}
              />

              <Button isLoading={isLoading} className="h-[56px]">
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Drawer>
  );
}

export default AddExpense;
