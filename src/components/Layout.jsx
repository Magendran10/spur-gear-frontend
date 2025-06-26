// src/components/Layout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex  bg-gray-100 relative">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <button
            id="menu-button"
            className="text-2xl block"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            ☰
          </button>
        
          <div className="text-gray-600">Welcome, Magendran</div>
        </header>

       
      </div>
    </div>
  );
}
