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
      filtered = filtered.filter((item) => {
        const moduleValue = item["module"] || "";
        return moduleValue.toLowerCase().includes(moduleFilter.toLowerCase());
      });
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
    filteredData.reduce((sum, g) => sum + (g["Diameter (mm)"] || 0), 0) / filteredData.length
  ).toFixed(2);

  const averageThickness = (
    filteredData.reduce((sum, g) => sum + (g["Corrected Thickness (mm)"] || 0), 0) / filteredData.length
  ).toFixed(3);

  const defectRate = (
    (filteredData.filter((g) => g.Status === "FAIL").length / (filteredData.length || 1)) * 100
  ).toFixed(1);

  const trendData = Object.values(
    filteredData.reduce((acc, g) => {
      const date = dayjs(g.inspection_date).format("YYYY-MM-DD");
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

  return (
    <div className="p-6 min-h-screen bg-slate-900 text-yellow-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-300">Gear Analysis</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          className="border border-yellow-400 bg-slate-800 text-white p-2 rounded"
          placeholder="Filter by Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />
        <input
          type="text"
          className="border border-yellow-400 bg-slate-800 text-white p-2 rounded"
          placeholder="Filter by Module"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        />
        <input
          type="date"
          className="border border-yellow-400 bg-slate-800 text-white p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border border-yellow-400 bg-slate-800 text-white p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-800 border border-yellow-400 shadow-md">
          <CardContent className="p-4">
            <p className="text-yellow-300">Avg. Diameter</p>
            <h2 className="text-xl font-semibold text-yellow-100">{averageDiameter} mm</h2>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border border-yellow-400 shadow-md">
          <CardContent className="p-4">
            <p className="text-yellow-300">Avg. Thickness</p>
            <h2 className="text-xl font-semibold text-yellow-100">{averageThickness} mm</h2>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border border-yellow-400 shadow-md">
          <CardContent className="p-4">
            <p className="text-yellow-300">Defect Rate</p>
            <h2 className="text-xl font-semibold text-yellow-100">{defectRate}%</h2>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <div className="bg-slate-800 p-4 rounded-xl shadow-md mb-6 border border-yellow-500">
        <h3 className="text-lg font-semibold mb-4 text-yellow-200">Pass vs Fail Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <XAxis dataKey="date" stroke="#facc15" />
            <YAxis stroke="#facc15" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="PASS" stroke="#22d3ee" strokeWidth={2} />
            <Line type="monotone" dataKey="FAIL" stroke="#f87171" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart by Module */}
      <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-yellow-500">
        <h3 className="text-lg font-semibold mb-4 text-yellow-200">Pass vs Fail by Module</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={moduleData}>
            <XAxis dataKey="module" stroke="#facc15" />
            <YAxis stroke="#facc15" />
            <Tooltip />
            <Legend />
            <Bar dataKey="PASS" fill="#22d3ee" />
            <Bar dataKey="FAIL" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
