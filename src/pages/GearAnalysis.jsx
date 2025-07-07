import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/card";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import dayjs from "dayjs";

export default function GearAnalysis() {
  const [gearData, setGearData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [sourceModel, setSourceModel] = useState("");
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
    if (sourceModel) {
      filtered = filtered.filter((item) =>
        item.source_model_model2 === sourceModel ||
        item.source_model_model3 === sourceModel
      );
    }
    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const date = new Date(item.inspection_date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    setFilteredData(filtered);
  }, [batchId, sourceModel, startDate, endDate, gearData]);

  // Summary values
  const averageDiameter = (
    filteredData.reduce((sum, g) => sum + (g["Diameter (mm)"] || 0), 0) / filteredData.length
  ).toFixed(2);

  const averageThickness = (
    filteredData.reduce((sum, g) => sum + (g["Corrected Thickness (mm)"] || 0), 0) / filteredData.length
  ).toFixed(3);

  const defectRate = (
    (filteredData.filter((g) => g.Status === "FAIL").length / (filteredData.length || 1)) * 100
  ).toFixed(1);

  // Chart: PASS vs FAIL over time
  const trendData = Object.values(
    filteredData.reduce((acc, g) => {
      const date = dayjs(g.inspection_date).format("YYYY-MM-DD");
      acc[date] = acc[date] || { date, PASS: 0, FAIL: 0 };
      acc[date][g.Status]++;
      return acc;
    }, {})
  );

  // Chart: PASS vs FAIL by source model
  const modelData = Object.values(
    filteredData.reduce((acc, g) => {
      const model = g.source_model_model2 || g.source_model_model3 || "unknown";
      acc[model] = acc[model] || { model, PASS: 0, FAIL: 0 };
      acc[model][g.Status]++;
      return acc;
    }, {})
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Gear Analysis</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Filter by Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        />
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Filter by Source Model"
          value={sourceModel}
          onChange={(e) => setSourceModel(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 shadow-md">
          <CardContent className="p-4">
            <p className="text-gray-500">Avg. Diameter</p>
            <h2 className="text-xl font-semibold">{averageDiameter} mm</h2>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-md">
          <CardContent className="p-4">
            <p className="text-gray-500">Avg. Thickness</p>
            <h2 className="text-xl font-semibold">{averageThickness} mm</h2>
          </CardContent>
        </Card>
        <Card className="bg-red-50 shadow-md">
          <CardContent className="p-4">
            <p className="text-gray-500">Defect Rate</p>
            <h2 className="text-xl font-semibold">{defectRate}%</h2>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart: Pass vs Fail over time */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Pass vs Fail Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="PASS" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="FAIL" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart: Pass vs Fail by Model */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Pass vs Fail by Model</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={modelData}>
            <XAxis dataKey="model" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="PASS" fill="#10b981" />
            <Bar dataKey="FAIL" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
