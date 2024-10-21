import React, { useEffect, useMemo, useState } from "react";
import DashboardTable from "../components/dashboard/DashboardTable";
import Container from "../ui/Container";
import Button from "../ui/Button";
import AddUser from "../modules/users/AddUser";
import { Search } from "lucide-react";
import { useLazyGetAdminUserQuery } from "../api/adminUsers";
import { columns } from "../modules/users/columns";

function Users() {
  const [open, setOpen] = useState(false);

  const [getAdminUsers, { data: adminUsers, isLoading, isError }] =
    useLazyGetAdminUserQuery();

  useEffect(() => {
    getAdminUsers("");
  }, [getAdminUsers]);

  const showDrawer = () => {
    setOpen(!open);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    return adminUsers?.filter((item) =>
      item?.email?.toLowerCase().includes(searchTerm?.toLowerCase())
    );
  }, [adminUsers, searchTerm]);
  return (
    <div>
      <div>
        <Container className="flex items-center justify-between">
          <div className="flex">
            <div className="border-[1px] px-[15px] py-[8px]">
              <p>All</p>
            </div>
          </div>

          <div className="mb-[3px] flex items-center gap-[8px]">
            <div className="flex cursor-pointer items-center gap-[3px] border-b-[1px] px-[8px] py-[8px] ">
              <Search size={16} className="text-neutral-300" />
              <input
                onChange={(e) => setSearchTerm(e.target.value)}
                className=" py-[2px] text-[0.865rem]"
                placeholder="Search by email..."
              />
            </div>
            <Button onClick={showDrawer} className="flex h-[36px] items-center">
              Add User
            </Button>
          </div>
        </Container>
      </div>
      <Container>
        <DashboardTable
          columns={columns}
          data={filteredOptions || adminUsers || []}
          isFetching={isLoading}
          action={() => getAdminUsers("")}
          type={"users"}
        />
        <AddUser open={open} setShowDrawer={setOpen} />
      </Container>
    </div>
  );
}

export default Users;
