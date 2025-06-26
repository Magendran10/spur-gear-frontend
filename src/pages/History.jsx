

import '/src/App.css'
import '/src/index.css';

import React, { useState } from "react";
import axios from "axios";

const HistoryPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gearData, setGearData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get("http://127.0.0.1:8000/api/history", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      setGearData(res.data || []);
    } catch (err) {
      setError("Failed to fetch data. Please check your backend or network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-400 mb-6">
        🕰️ Gear Inspection History
      </h1>

      <div className="flex flex-col md:flex-row justify-center gap-4 items-center mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800"
        />
        <span className="text-xl">→</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 rounded-md border dark:border-gray-600 bg-white dark:bg-gray-800"
        />
        <button
          onClick={fetchHistory}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold shadow"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {loading ? (
        <p className="text-center text-blue-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm shadow-md bg-white dark:bg-gray-800 rounded-md">
            <thead className="bg-purple-200 dark:bg-purple-700 text-purple-900 dark:text-white">
              <tr>
                <th className="p-2 border">Image</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Batch ID</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Teeth</th>
                <th className="p-2 border">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {gearData.length > 0 ? (
                gearData.map((gear, index) => (
                  <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="p-2 border">
                      <img
                        src={`http://127.0.0.1:8000/images/${gear["Image Name"]}`}
                        alt="Gear"
                        className="w-16 h-16 object-contain rounded"
                      />
                    </td>
                    <td className="p-2 border">{gear.inspection_date?.split("T")[0]}</td>
                    <td className="p-2 border">{gear.batch_time}</td>
                    <td className="p-2 border">{gear.batch_id}</td>
                    <td className={`p-2 border font-semibold ${gear.Status === "FAIL" ? "text-red-600" : "text-green-600"}`}>
                      {gear.Status}
                    </td>
                    <td className="p-2 border">{gear.no_of_teeth}</td>
                    <td className="p-2 border">{gear.predicted_module || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    No data found for selected range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
