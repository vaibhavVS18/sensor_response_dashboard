"use client";
import { useState, useEffect } from "react";

export default function RakshakDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/latest");
      const json = await res.json();
      setData(json);
    };

    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  if (!data || data.message === "no data yet") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold mb-3">Rakshak Safety Dashboard</h1>
          <p className="text-slate-400">
            Waiting for sensor data...  
            <br />
            Send POST → <code className="bg-slate-800 px-2 py-1 rounded">/api/predict</code>
          </p>
        </div>
      </div>
    );
  }

  const prediction = data.prediction;
  const status = prediction?.danger ? "CRITICAL" : "SAFE";
  const statusColor = prediction?.danger ? "bg-red-900/40 text-red-300" : "bg-green-900/40 text-green-300";

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-6xl space-y-10">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Rakshak – Smart Safety Vest</h1>
          <p className="text-slate-400 text-lg">Real-Time Health & Safety Monitoring System</p>
        </header>

        {/* Status Card */}
        <div className={`rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800 ${statusColor}`}>
          <h2 className="text-2xl font-bold">Status: {prediction.danger ? "⚠️ Critical Condition" : "✅ Normal Condition"}</h2>
          <p className="mt-2 text-slate-200 text-lg">{prediction.reason}</p>
          <p className="mt-2 text-slate-300">Detected at: {new Date(data.timestamp).toLocaleString()}</p>
        </div>

        {/* Vital Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Heart Rate Card */}
          <VitalCard
            title="Heart Rate"
            value={`${data.sensor.heartRate} BPM`}
            healthy={data.sensor.heartRate < 110 && data.sensor.heartRate > 50}
          />

          {/* SpO2 Card */}
          <VitalCard
            title="SpO₂ Level"
            value={`${data.sensor.spo2}%`}
            healthy={data.sensor.spo2 >= 94}
          />

          {/* Temperature Card */}
          <VitalCard
            title="Body Temperature"
            value={`${data.sensor.temperature}°C`}
            healthy={data.sensor.temperature >= 36 && data.sensor.temperature <= 38}
          />

          {/* Motion Card */}
          <VitalCard
            title="Motion / Fall Detection"
            value={data.sensor.motion ? "Fall Detected" : "Normal"}
            healthy={!data.sensor.motion}
          />
        </div>

        {/* Confidence Indicator */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xl font-semibold text-slate-300">ML Confidence Score</h3>

          <div className="bg-slate-800 rounded-full h-5 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${(prediction.score * 100).toFixed(0)}%` }}
            ></div>
          </div>

          <p className="text-slate-300 font-medium text-lg">
            {(prediction.score * 100).toFixed(0)}% Confidence
          </p>
        </div>

        {/* Emergency Instructions */}
        {prediction.danger && (
          <div className="bg-red-900/30 border border-red-700 p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-2xl font-bold text-red-300">🚨 Emergency Precautions</h3>
            <ul className="list-disc list-inside space-y-2 text-red-200 text-lg">
              <li>Move to a safe area immediately.</li>
              <li>Contact caretaker or emergency services.</li>
              <li>Stay calm and avoid sudden movements.</li>
              <li>Ensure proper ventilation and hydration.</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

function VitalCard({ title, value, healthy }) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
      <h3 className="text-slate-400 text-sm uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      <p className={`text-sm font-medium ${healthy ? "text-green-400" : "text-red-400"}`}>
        {healthy ? "Normal" : "Alert"}
      </p>
    </div>
  );
}
