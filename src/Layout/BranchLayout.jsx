// src/components/layout/branchLayout.jsx
import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { BranchSidebar } from "@/components/Sidebar/BranchSidebar";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import { useSelector } from "react-redux";

export default function BranchLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isLoading = useSelector((state) => state.loader.isLoading);

  return (
    <SidebarProvider>
      <div className="bg-gray-50 w-full flex min-h-screen font-cairo">
        {!isLoginPage && <BranchSidebar />}
        <SidebarInset className="w-full overflow-x-hidden flex flex-col bg-gray-50">
          {!isLoginPage && <Navbar className="p-2" />}
          <div className="w-full relative flex-1 p-4">
            {isLoading && <Loading />}
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}