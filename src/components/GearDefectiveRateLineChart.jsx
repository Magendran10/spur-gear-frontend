import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

// Day.js plugins
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

// Determine grouping key
const getGroupKey = (start, end) => {
  const days = dayjs(end).diff(dayjs(start), "day");
  if (days === 0) return "batch";
  if (days <= 31) return "day";
  if (days <= 365) return "month";
  return "year";
};

// Generate rate buckets
const generateRateBuckets = (startDate, endDate, groupKey) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const buckets = {};

  let current = start.clone();

  while (
    (groupKey === "day" && current.isSameOrBefore(end, "day")) ||
    (groupKey === "month" && current.isSameOrBefore(end, "month")) ||
    (groupKey === "year" && current.isSameOrBefore(end, "year"))
  ) {
    let label;
    if (groupKey === "day") {
      label = current.format("MMM DD");
      current = current.add(1, "day");
    } else if (groupKey === "month") {
      label = current.format("MMM YYYY");
      current = current.add(1, "month");
    } else if (groupKey === "year") {
      label = current.format("YYYY");
      current = current.add(1, "year");
    }

    buckets[label] = { name: label, rate: 0, total: 0, fail: 0 };
  }

  return buckets;
};

export default function GearDefectiveRateLineChart({ data }) {
  const [startDate, setStartDate] = useState(
    dayjs().subtract(6, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [chartType, setChartType] = useState("line"); // line or area

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

  const chartData = useMemo(() => {
    const groupKey = getGroupKey(startDate, endDate);
    const buckets = generateRateBuckets(startDate, endDate, groupKey);

    data.forEach((gear) => {
      const date = dayjs(gear.inspection_date);
      if (!date.isBetween(startDate, endDate, "day", "[]")) return;

      let key;
      if (groupKey === "day") {
        key = date.format("MMM DD");
      } else if (groupKey === "month") {
        key = date.format("MMM YYYY");
      } else if (groupKey === "year") {
        key = date.format("YYYY");
      }

      if (buckets[key]) {
        buckets[key].total += 1;
        if (gear.Status === "FAIL") {
          buckets[key].fail += 1;
        }
      }
    });

    return Object.values(buckets).map((entry) => ({
      ...entry,
      rate:
        entry.total > 0
          ? parseFloat(((entry.fail / entry.total) * 100).toFixed(2))
          : 0,
    }));
  }, [data, startDate, endDate]);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📊 Defective Rate & Count Over Time
        </h2>
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

      <div className="flex flex-wrap gap-4 mb-4 text-sm items-center">
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
        <button
          onClick={() =>
            setChartType((prev) => (prev === "line" ? "area" : "line"))
          }
          className="ml-auto bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
        >
          Toggle to {chartType === "line" ? "Area" : "Line"} Chart
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        {chartType === "line" ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
            <YAxis
              yAxisId="left"
              label={{
                value: "Defective Rate (%)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: "Total Gears",
                angle: -90,
                position: "insideRight",
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="rate"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 3 }}
              name="Defective Rate (%)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Total Gears"
            />
          </LineChart>
        ) : (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
            <YAxis
              yAxisId="left"
              label={{
                value: "Defective Rate (%)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: "Total Gears",
                angle: -90,
                position: "insideRight",
              }}
            />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="rate"
              stroke="#f97316"
              fill="#fef3c7"
              strokeWidth={3}
              name="Defective Rate (%)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              fill="#dbeafe"
              strokeWidth={2}
              name="Total Gears"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
