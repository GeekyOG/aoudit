import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import React from "react";
import { deviceType } from "../utils/checkDevice";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const [user] = useState(Cookies.get("authToken"));

  const navigate = useNavigate();
  // const device = deviceType();

  useEffect(() => {
    // if (device == "This is a mobile device.") {
    //   navigate("/device");
    // }

    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return <div>{children}</div>;
};

export default PublicRoute;
