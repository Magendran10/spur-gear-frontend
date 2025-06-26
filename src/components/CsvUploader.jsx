import React, { useState } from "react";
import axios from "axios";

export default function GearUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("⚠️ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://spur-gear-backend.onrender.com/api/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setStatus(`✅ Success: ${response.data.message || "File uploaded."}`);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("❌ Failed to upload file.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Gear Data CSV</h2>
      
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleUpload}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
      >
        Upload File
      </button>

      {status && (
        <p className={`mt-4 text-sm ${status.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
          {status}
        </p>
      )}
    </div>
  );
}
