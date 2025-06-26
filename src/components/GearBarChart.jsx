import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState, useMemo } from "react";
import dayjs from "dayjs";

// Define fixed batch slots
const batchSlots = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "Others", // For fallback
];

// Determine grouping granularity
const getGroupKey = (start, end) => {
  const days = dayjs(end).diff(dayjs(start), "day");
  if (days === 0) return "batch";
  if (days <= 31) return "day";
  if (days <= 365) return "month";
  return "year";
};

// Create empty buckets
const generateBuckets = (startDate, endDate, groupKey) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const buckets = {};

  if (groupKey === "batch") {
    batchSlots.forEach((slot) => {
      buckets[slot] = { name: slot, Defective: 0, Non_defective: 0 };
    });
  } else if (groupKey === "day") {
    let current = start.clone();
    while (current.isSame(end) || current.isBefore(end)) {
      const label = current.format("MMM DD");
      buckets[label] = { name: label, Defective: 0, Non_defective: 0 };
      current = current.add(1, "day");
    }
  } else if (groupKey === "month") {
    let current = start.clone().startOf("month");
    while (current.isSame(end, "month") || current.isBefore(end)) {
      const label = current.format("MMM YYYY");
      buckets[label] = { name: label, Defective: 0, Non_defective: 0 };
      current = current.add(1, "month");
    }
  } else if (groupKey === "year") {
    let current = start.clone().startOf("year");
    while (current.isSame(end, "year") || current.isBefore(end)) {
      const label = current.format("YYYY");
      buckets[label] = { name: label, Defective: 0, Non_defective: 0 };
      current = current.add(1, "year");
    }
  }

  return buckets;
};

export default function GearBarChart({ data }) {
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

  const chartData = useMemo(() => {
    const groupKey = getGroupKey(startDate, endDate);
    const buckets = generateBuckets(startDate, endDate, groupKey);

    const start = dayjs(startDate).startOf("day");
    const end = dayjs(endDate).endOf("day"); // Ensure full end day is included

    data.forEach((gear) => {
      const date = dayjs(gear.inspection_date);
      if (date.isBefore(start) || date.isAfter(end)) return;

      let key;
      if (groupKey === "batch") {
        key = batchSlots.includes(gear.batch_time)
          ? gear.batch_time
          : "Others";
      } else if (groupKey === "day") {
        key = date.format("MMM DD");
      } else if (groupKey === "month") {
        key = date.format("MMM YYYY");
      } else if (groupKey === "year") {
        key = date.format("YYYY");
      }

      if (!buckets[key]) {
        buckets[key] = { name: key, Defective: 0, Non_defective: 0 };
      }

      if (gear.Status === "FAIL") {
        buckets[key].Defective += 1;
      } else if (gear.Status === "PASS") {
        buckets[key].Non_defective += 1;
      }
    });

    return Object.values(buckets);
  }, [data, startDate, endDate]);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          📊 Gear Defects Over Time
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

      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={70}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="Non_defective"
            stackId="a"
            fill="#34d399"
            name="Non-defective"
            barSize={18}
          />
          <Bar
            dataKey="Defective"
            stackId="a"
            fill="#f87171"
            name="Defective"
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
