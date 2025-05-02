import React from "react";
import { MobileSidebar } from "./MobileSidebar";
import NavbarRoutes from "../../../components/NavbarRoutes";

export const Navbar = () => {
  return (
    <div className="p-2 md:p-4 border-b h-full flex items-center bg-white shadow-sm z-50">
      <MobileSidebar />
      <div className="flex-1">
        <NavbarRoutes />
      </div>
    </div>
  );
};
