import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../components/card.jsx";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import dayjs from "dayjs";

export default function GearAnalysis() {
  const [gearData, setGearData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    axios.get("https://spur-gear-backend.onrender.com/api/gears").then((res) => {
      setGearData(res.data);
      setFilteredData(res.data);
    });
  }, []);

  useEffect(() => {
    let filtered = gearData;

    if (batchId) {
      filtered = filtered.filter((item) => item.batch_id === batchId);
    }
    if (moduleFilter) {
      filtered = filtered.filter((item) => item["module"] === moduleFilter);
    }
    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const date = new Date(item.inspection_date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    setFilteredData(filtered);
  }, [batchId, moduleFilter, startDate, endDate, gearData]);

  const averageDiameter = (
    filteredData.reduce((sum, g) => sum + (g["Diameter (mm)"] || 0), 0) / (filteredData.length || 1)
  ).toFixed(2);

  const averageThickness = (
    filteredData.reduce((sum, g) => sum + (g["Corrected Thickness (mm)"] || 0), 0) / (filteredData.length || 1)
  ).toFixed(3);

  const defectRate = (
    (filteredData.filter((g) => g.Status === "FAIL").length / (filteredData.length || 1)) * 100
  ).toFixed(1);

  const trendData = Object.values(
    filteredData.reduce((acc, g) => {
      const date = dayjs(g.inspection_date).format("DD/MM/YYYY");
      acc[date] = acc[date] || { date, PASS: 0, FAIL: 0 };
      acc[date][g.Status]++;
      return acc;
    }, {})
  );

  const moduleData = Object.values(
    filteredData.reduce((acc, g) => {
      const moduleType = g["module"] || "Unknown";
      if (!acc[moduleType]) {
        acc[moduleType] = { module: moduleType, PASS: 0, FAIL: 0 };
      }
      acc[moduleType][g.Status]++;
      return acc;
    }, {})
  );

  const uniqueModules = [...new Set(gearData.map((g) => g["module"]).filter(Boolean))];

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-700 dark:text-yellow-400">
        📊 Gear Analysis
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          className="border p-2 rounded shadow-sm bg-white dark:bg-gray-800 dark:border-gray-600"
          placeholder="Filter by Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />
        <select
          className="border p-2 rounded shadow-sm bg-white dark:bg-gray-800 dark:border-gray-600"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="">All Modules</option>
          {uniqueModules.map((mod) => (
            <option key={mod} value={mod}>
              {mod}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border p-2 rounded shadow-sm bg-white dark:bg-gray-800 dark:border-gray-600"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded shadow-sm bg-white dark:bg-gray-800 dark:border-gray-600"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-blue-700 dark:text-blue-300 font-medium">Average Diameter</p>
            <h2 className="text-2xl font-bold">{averageDiameter} mm</h2>
          </CardContent>
        </Card>
        <Card className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-green-700 dark:text-green-300 font-medium">Average Thickness</p>
            <h2 className="text-2xl font-bold">{averageThickness} mm</h2>
          </CardContent>
        </Card>
        <Card className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-red-700 dark:text-red-300 font-medium">Defect Rate</p>
            <h2 className="text-2xl font-bold">{defectRate}%</h2>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-yellow-300">📅 Pass vs Fail Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="PASS" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="FAIL" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-yellow-300">⚙️ Pass vs Fail by Module</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={moduleData}>
            <XAxis dataKey="module" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Bar dataKey="PASS" fill="#60a5fa" />
            <Bar dataKey="FAIL" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
