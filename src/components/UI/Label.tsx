 import React from "react";

export const Label = ({ htmlFor, children, className = "" }: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none ${className}`}
  >
    {children}
  </label>
);
