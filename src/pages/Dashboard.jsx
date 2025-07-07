import { useState, useEffect } from "react";
import GearBarChart from "../components/GearBarChart";

import GearDefectiveRateLineChart from "../components/GearDefectiveRateLineChart";
import GearPieChart from "../components/GearPieChart";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [gearData, setGearData] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    fetch("https://spur-gear-backend.onrender.com/api/gears")
      .then((res) => res.json())
      .then((gears) => {
        if (Array.isArray(gears)) {
          const totalProcessed = gears.length;
          const totalDefects = gears.filter((gear) => gear.Status === "FAIL").length;
          const totalCorrect = gears.filter((gear) => gear.Status === "PASS").length;

          const lastCheckDate = gears.reduce((latest, gear) => {
            const date = new Date(gear.inspection_date);
            return date > latest ? date : latest;
          }, new Date(0));

          const lastCheck = lastCheckDate.toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).replace(",", "");

          setStats({
            gears_processed: totalProcessed,
            defects_found: totalDefects,
            correct_gears: totalCorrect,
            last_check: lastCheck,
          });

          setGearData(gears);
        } else {
          console.error("Unexpected API response:", gears);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-blue-500 font-semibold">Loading dashboard...</div>;
  if (!stats || typeof stats !== "object") {
    return <div className="p-4 text-red-500 font-semibold">Failed to load dashboard data.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      {/* Header with Dark Mode Toggle */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-blue-800 dark:text-blue-400">
          🧩 Gear Defect Dashboard
        </h1>
        
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">📈 Gears Processed</h2>
          <p className="text-2xl font-bold">{stats.gears_processed}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">❌ Defects Found</h2>
          <p className="text-2xl font-bold">{stats.defects_found}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">✅ Correct Gears</h2>
          <p className="text-2xl font-bold">{stats.correct_gears}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 rounded shadow text-center">
          <h2 className="text-lg font-semibold">⏱️ Last Check</h2>
          <p className="text-md font-bold">{stats.last_check}</p>
        </div>
      </section>

      {/* Charts & Latest Gear Info */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 space-y-6">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">📊 Defects Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow border dark:border-gray-600">
            <h3 className="font-semibold text-center mb-2">Daily Inspection Count</h3>
            <GearPieChart data={gearData} mode="daily" />
          </div>

          {/* Latest Gear Info (Enhanced) */}
         <div className="bg-gradient-to-br from-purple-200 to-purple-400 dark:from-purple-800 dark:to-purple-900 p-6 rounded-2xl shadow-xl text-white transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
  <h3 className="text-2xl font-extrabold text-center mb-6 font-mono">🛠️ Latest Gear Details</h3>

  {gearData.length > 0 ? (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-lg font-mono">
      <p className="font-semibold">🔖 Batch ID:</p>
      <p className="font-bold">{gearData[gearData.length - 1].batch_id}</p>

      <p className="font-semibold">🕒 Inspection Date:</p>
      <p className="font-bold">
        {new Date(gearData[gearData.length - 1].inspection_date).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
      </p>

      <p className="font-semibold">🔍 Status:</p>
      <p className={`font-bold ${gearData[gearData.length - 1].Status === "FAIL" ? "text-red-200" : "text-green-200"}`}>
        {gearData[gearData.length - 1].Status}
      </p>

      <p className="font-semibold">⚙️ Module:</p>
      <p className="font-bold">{gearData[gearData.length - 1].module}</p>

      <p className="font-semibold">🧮 No. of Teeth:</p>
      <p className="font-bold">{gearData[gearData.length - 1].no_of_teeth}</p>

      <p className="font-semibold">📏 Predicted Module:</p>
      <p className="font-bold">{gearData[gearData.length - 1].predicted_module}</p>

      <p className="font-semibold">🔢 Detected Teeth:</p>
      <p className="font-bold">{gearData[gearData.length - 1].Detected_teeth}</p>
    </div>
  ) : (
    <p className="text-center text-white text-lg font-semibold">No gear data available.</p>
  )}
</div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow border dark:border-gray-600">
            <h3 className="font-semibold text-center mb-2">Defect Count by Batch</h3>
            <GearBarChart data={gearData} />
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow border dark:border-gray-600">
            <h3 className="font-semibold text-center mb-2">Defect Trend Over Time</h3>
            <GearDefectiveRateLineChart data={gearData} />
          </div>
        </div>
      </section>
    </div>
  );
}
