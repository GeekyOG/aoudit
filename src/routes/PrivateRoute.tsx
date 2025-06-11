import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import React from "react";
import { deviceType, isiOS } from "../utils/checkDevice";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [user] = useState(Cookies.get("authToken"));

  const device = deviceType();
  const navigate = useNavigate();

  useEffect(() => {
    // if (device == "This is a mobile device.") {
    //   navigate("/device");
    // }

    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return <div>{children}</div>;
};

export default PrivateRoute;
