import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [gear, setGear] = useState(null);

  useEffect(() => {
    axios.get("https://spur-gear-backend.onrender.com/api/latest-gears")
      .then((res) => {
        setGear(res.data[0]); // Take the most recent gear
      })
      .catch((err) => {
        console.error("Error fetching gear data", err);
      });
  }, []);

  if (!gear) {
    return <div className="text-center mt-10 text-xl">Loading latest gear inspection...</div>;
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center px-4 py-8"
      style={{
        backgroundImage: "url('/images/dashboard-bg.jpg')", // Make sure this is in public/images/
      }}
    >
      <div className="bg-white/20 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-3xl border border-white/40">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-white mb-6 font-mono">
          🛠️ Latest Gear Inspection
        </h2>

        <div className="flex justify-center mb-6">
          <img
            src={`https://spur-gear-backend.onrender.com/images/${gear["Image Name"]}`}
            alt="Gear"
            className="w-44 h-44 object-contain rounded-xl border-4 border-white shadow-md bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-lg font-mono text-white">
          <p className="text-right pr-2 font-semibold">Status:</p>
          <p className={`text-left pl-2 font-bold ${gear.Status === "FAIL" ? "text-red-300" : "text-green-300"}`}>
            {gear.Status}
          </p>

          <p className="text-right pr-2 font-semibold">Diameter (mm):</p>
          <p className="text-left pl-2">{gear["Diameter (mm)"]}</p>

          <p className="text-right pr-2 font-semibold">Corrected Thickness (mm):</p>
          <p className="text-left pl-2">{gear["Corrected Thickness (mm)"]}</p>

          <p className="text-right pr-2 font-semibold">Batch ID:</p>
          <p className="text-left pl-2">{gear.batch_id}</p>

          <p className="text-right pr-2 font-semibold">Inspection Date:</p>
          <p className="text-left pl-2">{gear.inspection_date?.split("T")[0]}</p>

          <p className="text-right pr-2 font-semibold">Batch Time:</p>
          <p className="text-left pl-2">{gear.batch_time}</p>

          <p className="text-right pr-2 font-semibold">Actual Module:</p>
          <p className="text-left pl-2">{gear.module}</p>

          <p className="text-right pr-2 font-semibold">Predicted Module:</p>
          <p className="text-left pl-2">{gear.predicted_module || "N/A"}</p>

          <p className="text-right pr-2 font-semibold">Actual No. of Teeth:</p>
          <p className="text-left pl-2">{gear.no_of_teeth || "N/A"}</p>

          <p className="text-right pr-2 font-semibold">Detected Teeth:</p>
          <p className="text-left pl-2">{gear.Detected_teeth || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
