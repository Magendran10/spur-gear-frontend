import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { useState, useMemo } from "react";
import dayjs from "dayjs";

const COLORS = ["#34d399", "#f87171"];

export default function GearPieChart({ data }) {
  const [startDate, setStartDate] = useState(
    dayjs().subtract(6, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));

  const handleQuickFilter = (range) => {
    const today = dayjs();
    if (range === "today") {
      setStartDate(today.format("YYYY-MM-DD"));
      setEndDate(today.format("YYYY-MM-DD"));
    } else if (range === "week") {
      setStartDate(today.startOf("week").format("YYYY-MM-DD"));
      setEndDate(today.endOf("week").format("YYYY-MM-DD"));
    } else if (range === "month") {
      setStartDate(today.startOf("month").format("YYYY-MM-DD"));
      setEndDate(today.endOf("month").format("YYYY-MM-DD"));
    } else if (range === "year") {
      setStartDate(today.startOf("year").format("YYYY-MM-DD"));
      setEndDate(today.endOf("year").format("YYYY-MM-DD"));
    }
  };

  const filteredData = useMemo(() => {
    const start = dayjs(startDate).startOf("day");
    const end = dayjs(endDate).endOf("day");

    return data.filter((gear) => {
      const inspectionDate = dayjs(gear.inspection_date);
      return inspectionDate.isAfter(start.subtract(1, "millisecond")) &&
             inspectionDate.isBefore(end.add(1, "millisecond"));
    });
  }, [data, startDate, endDate]);

  const totalProcessed = filteredData.length;
  const totalDefective = filteredData.filter((gear) => gear.Status === "FAIL").length;
  const totalOk = totalProcessed - totalDefective;
  const defectivePercent = totalProcessed === 0 ? 0 : Math.round((totalDefective / totalProcessed) * 100);

  const pieData = [
    { name: "OK", value: totalOk },
    { name: "Defective", value: totalDefective },
  ];

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">🧩 Overall Gear Quality</h2>
        <div className="flex flex-wrap gap-2">
          {["today", "week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => handleQuickFilter(range)}
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 text-sm capitalize"
            >
              {range === "today"
                ? "Today"
                : range === "week"
                ? "This Week"
                : range === "month"
                ? "This Month"
                : "This Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="font-medium">Start:</label>
          <input
            type="date"
            className="border border-gray-300 p-1 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">End:</label>
          <input
            type="date"
            className="border border-gray-300 p-1 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
            <Label
              value={`${defectivePercent}% Defective`}
              position="center"
              fontSize={16}
              fill="#1f2937"
            />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
