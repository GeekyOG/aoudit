import clsx from "clsx";
import type { FunctionComponent } from "react";
import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: FunctionComponent<ContainerProps> = ({
  children,
  className,
}) => (
  <div
    className={clsx("lg:px-50px mx-auto max-w-[1110px] px-[24px]", className)}
  >
    {children}
  </div>
);

export default Container;
