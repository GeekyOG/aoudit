import React from "react";
import Button from "../ui/Button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UnAuthorizedPage() {
  const navigate = useNavigate();
  return (
    <main
      style={{
        width: "100%",
        marginTop: "10%",
        marginLeft: "20%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "5px",
      }}
    >
      <img src="/unauthorized.svg" alt="image" />
      <p className="font-bold text-2xl">No Access</p>{" "}
      <p className="text-base">
        You do not have the required permissions to <br /> make changes here.
        Contact your admin.
      </p>
      <Button
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        Back to home
      </Button>
    </main>
  );
}

export default UnAuthorizedPage;
