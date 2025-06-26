import '/src/App.css';
import '/src/index.css';

import React, { useState } from "react";
import axios from "axios";

const HistoryPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gearData, setGearData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const fetchHistory = async () => {
    if (!startDate || !endDate) {
      setError("⚠️ Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get("http://127.0.0.1:8000/api/gears");
      const allData = res.data || [];

      const start = new Date(startDate + "T00:00:00");
      const end = new Date(endDate + "T23:59:59");

      const filtered = allData.filter((gear) => {
        if (!gear.inspection_date) return false;
        const inspectionDate = new Date(gear.inspection_date);
        const isInRange = inspectionDate >= start && inspectionDate <= end;
        const matchesStatus =
          statusFilter === "ALL" || gear.Status === statusFilter;
        return isInRange && matchesStatus;
      });

      setGearData(filtered);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to fetch data. Please check your backend or network.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!gearData.length) return;

    const headers = Object.keys(gearData[0]);
    const rows = gearData.map(row =>
      headers.map(field => JSON.stringify(row[field] ?? "")).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "gear_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(gearData.length / itemsPerPage);
  const paginatedData = gearData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100 p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
          <h1 className="text-4xl font-extrabold text-center text-purple-600 dark:text-purple-400 mb-6">
            🕰️ Gear Inspection History
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 rounded-md border shadow-sm dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-400 transition"
            />
            <span className="text-xl font-bold">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 rounded-md border shadow-sm dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-400 transition"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-md border shadow-sm dark:border-gray-600 bg-white dark:bg-gray-900 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
            </select>

            <button
              onClick={fetchHistory}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md font-semibold shadow transition"
            >
              🔍 Search
            </button>

            <button
              onClick={downloadCSV}
              disabled={!gearData.length}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-semibold shadow disabled:opacity-50 transition"
            >
              📥 Download CSV
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-center font-medium mb-4">{error}</p>
          )}

          {loading ? (
            <p className="text-center text-blue-500 font-semibold animate-pulse">
              Loading...
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md shadow-md">
                <table className="min-w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
                  <thead className="bg-purple-100 dark:bg-purple-800 text-purple-900 dark:text-white text-left">
                    <tr>
                      <th className="p-3 border">Image</th>
                      <th className="p-3 border">Date</th>
                      <th className="p-3 border">Time</th>
                      <th className="p-3 border">Batch ID</th>
                      <th className="p-3 border">Status</th>
                      <th className="p-3 border">Teeth</th>
                      <th className="p-3 border">Detected Teeth</th>
                      <th className="p-3 border">Module</th>
                      <th className="p-3 border">Predicted Module</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((gear, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                          <td className="p-3 border">
                            <img
                              src={`http://127.0.0.1:8000/images/${gear["Image Name"]}`}
                              alt="Gear"
                              className="w-16 h-16 object-contain rounded shadow"
                            />
                          </td>
                          <td className="p-3 border">
                            {gear.inspection_date?.split("T")[0]}
                          </td>
                          <td className="p-3 border">{gear.batch_time}</td>
                          <td className="p-3 border">{gear.batch_id}</td>
                          <td
                            className={`p-3 border font-semibold ${
                              gear.Status === "FAIL"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {gear.Status}
                          </td>
                          <td className="p-3 border">{gear.no_of_teeth}</td>
                          <td className="p-3 border">{gear.Detected_teeth}</td>
                          <td className="p-3 border">{gear.module}</td>
                          <td className="p-3 border">
                            {gear.predicted_module || "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center p-4 text-gray-500"
                        >
                          No data found for the selected range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {gearData.length > itemsPerPage && (
                <div className="flex justify-center mt-6 gap-4 items-center">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50 transition"
                  >
                    ◀ Prev
                  </button>
                  <span className="text-lg font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50 transition"
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
