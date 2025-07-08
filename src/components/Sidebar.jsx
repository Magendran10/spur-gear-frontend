// src/components/Sidebar.jsx
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest("#menu-button")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div
      ref={sidebarRef}
      id="sidebar"
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold">Gear Inspector</h2>
        <button onClick={onClose} className="text-gray-500 text-xl" aria-label="Close Sidebar">
          &times;
        </button>
      </div>
      <nav className="p-4 space-y-4">
        <Link to="/dashboard" className="block text-gray-700 hover:text-blue-500">Dashboard</Link>
        <Link to="/analysis" className="block text-gray-700 hover:text-blue-500">Gear Analysis</Link>
        {/* <Link to="/logs" className="block text-gray-700 hover:text-blue-500">Defect Logs</Link>  */}
        <Link to="/upload-csv" className="block text-gray-700 hover:text-blue-500">Upload-Data</Link>
        <Link to="/settings" className="block text-gray-700 hover:text-blue-500">Settings</Link>
      </nav>
    </div>
  );
}
