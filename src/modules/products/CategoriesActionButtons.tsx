import React, { useState } from "react";
import TableActionButtons from "../../ui/dashboard/TableActionButtons";
import AddCategory from "./AddCategoryDrawer";
import EditCategory from "./EditCategory";

interface CategoriesActionButtonsProps {
  id: string;
}

function CategoriesActionButtons({ id }: CategoriesActionButtonsProps) {
  const [showCategory, setShowCategory] = useState(false);

  return (
    <>
      <TableActionButtons
        handleEdit={() => {
          setShowCategory(true);
        }}
        handleDelete={() => {}}
      />
      <EditCategory
        id={id}
        open={showCategory}
        setShowDrawer={setShowCategory}
      />
    </>
  );
}

export default CategoriesActionButtons;
