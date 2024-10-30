import React from "react";
import Button from "../ui/Button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DevicePage() {
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
      <p className="font-bold text-1xl">Access Using a Desktop Device</p>{" "}
      <Button
        onClick={() => {
          navigate("/");
        }}
      >
        Back to home
      </Button>
    </main>
  );
}

export default DevicePage;
