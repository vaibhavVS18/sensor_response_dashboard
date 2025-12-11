"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);

  async function loadData() {
    const res = await fetch("/api/latest");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    loadData();
    const i = setInterval(loadData, 3000);
    return () => clearInterval(i);
  }, []);

  if (!data || data.message === "no data yet") {
    return (
      <div style={{ padding: 40, fontSize: 22 }}>
        No sensor data yet.  
        <br />
        Send POST → <code>/api/predict</code>
      </div>
    );
  }

  const isDanger = data?.prediction?.danger;

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Sensor Dashboard</h1>

      <div
        style={{
          padding: 20,
          borderRadius: 12,
          background: "#0F172A",
          color: "white",
          maxWidth: 400
        }}
      >
        <h3>Sensor Value</h3>
        <div style={{ fontSize: 36, fontWeight: "bold" }}>{data.sensor}</div>
        <p>{new Date(data.timestamp).toLocaleString()}</p>

        <h3>Status</h3>
        <div
          style={{
            padding: 15,
            borderRadius: 10,
            background: isDanger ? "#7F1D1D" : "#14532D",
            marginBottom: 10
          }}
        >
          {isDanger ? "⚠️ DANGER" : "✅ SAFE"}
        </div>

        <p>{data.prediction.reason}</p>
        <p>Confidence: {(data.prediction.score * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
}
