import React, { useState } from "react";

const FASTAPI_URL = "http://localhost:8000/upload-csv"; // your FastAPI endpoint

export default function CsvUploader() {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) return alert("Please select a CSV file.");

    const reader = new FileReader();
    reader.onload = async () => {
      const csv = reader.result;
      try {
        const response = await fetch(FASTAPI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/csv", // match the content type your backend expects
          },
          body: csv,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Upload failed");
        }

        const result = await response.json();
        alert(result.message || "Upload completed");
      } catch (err) {
        alert("Upload failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
        Upload CSV
      </button>
    </div>
  );
}
