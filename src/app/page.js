"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function RakshakDashboard() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [manualPrediction, setManualPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // Load latest + history every 3 seconds
  useEffect(() => {
    const load = async () => {
      const res1 = await fetch("/api/latest");
      const latest = await res1.json();
      setCurrent(latest);

      const res2 = await fetch("/api/history");
      const logs = await res2.json();
      setHistory(logs);
    };

    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  // If no data yet
  if (!current || current.message === "no data yet") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center px-6">
          <Image
            src="/logo.png"
            width={90}
            height={90}
            alt="Rakshak Logo"
            className="mx-auto mb-4"
          />

          <h1 className="text-4xl font-bold mb-3">Rakshak Safety Dashboard</h1>
          <p className="text-slate-400">
            Waiting for sensor data…  
            <br />
            Send POST →{" "}
            <code className="bg-slate-800 px-2 py-1 rounded">/api/predict</code>
          </p>
        </div>
      </div>
    );
  }

  // Manual prediction handler
  const runPrediction = async () => {
    setLoadingPrediction(true);
    setManualPrediction(null);

    const res = await fetch("/api/result", {
      method: "POST",
      body: JSON.stringify(current.sensor),
    });

    const data = await res.json();
    setManualPrediction(data.prediction);
    setLoadingPrediction(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">

      {/* HEADER */}
      <div className="text-center mb-10">
        <Image
          src="/logo.png"
          width={90}
          height={90}
          alt="Rakshak Logo"
          className="mx-auto mb-4"
        />
        <h1 className="text-4xl md:text-5xl font-bold">Rakshak – Smart Safety Vest</h1>
        <p className="text-slate-400 mt-2 text-lg">
          Real-Time Multi-Sensor Monitoring System
        </p>
      </div>

      {/* CURRENT SENSOR GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <VitalCard title="Temperature" value={`${current.sensor.temp} °C`} />
        <VitalCard title="Humidity" value={`${current.sensor.humidity} %`} />
        <VitalCard title="IR Sensor" value={current.sensor.ir === 1 ? "Object Detected" : "Clear"} />
        <VitalCard title="Accel X" value={current.sensor.ax} />
        <VitalCard title="Accel Y" value={current.sensor.ay} />
        <VitalCard title="Accel Z" value={current.sensor.az} />
      </div>

      {/* RUN PREDICTION BUTTON */}
      <div className="mt-10 text-center">
        <button
          onClick={runPrediction}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg font-semibold shadow-lg"
        >
          {loadingPrediction ? "Analyzing..." : "Run AI Prediction"}
        </button>
      </div>

      {/* MANUAL PREDICTION RESULT */}
      {manualPrediction && (
        <div className="mt-10 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-2xl font-bold mb-3">Prediction Result</h2>

          <p className="text-lg">
            Status:{" "}
            <span
              className={
                manualPrediction.status === "DANGER"
                  ? "text-red-400"
                  : "text-green-400"
              }
            >
              {manualPrediction.status}
            </span>
          </p>

          <p className="text-slate-300 mt-1">{manualPrediction.reason}</p>

          {manualPrediction.triggeredSensor && (
            <p className="mt-2 text-red-300">
              Triggered Sensor: <b>{manualPrediction.triggeredSensor}</b>
            </p>
          )}
        </div>
      )}

      {/* HISTORY TABLE */}
      <div className="mt-14 bg-slate-900 p-6 rounded-2xl border border-slate-800 overflow-x-auto">
        <h3 className="text-2xl font-bold mb-4 text-slate-300">
          📜 Sensor Data History (Live)
        </h3>

        <table className="w-full text-left text-slate-300 text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-2">Time</th>
              <th className="p-2">Temp</th>
              <th className="p-2">Hum</th>
              <th className="p-2">IR</th>
              <th className="p-2">AX</th>
              <th className="p-2">AY</th>
              <th className="p-2">AZ</th>
            </tr>
          </thead>

          <tbody>
            {history.map((log, index) => (
              <tr key={index} className="border-b border-slate-800">
                <td className="p-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="p-2">{log.sensor.temp}</td>
                <td className="p-2">{log.sensor.humidity}</td>
                <td className="p-2">{log.sensor.ir}</td>
                <td className="p-2">{log.sensor.ax}</td>
                <td className="p-2">{log.sensor.ay}</td>
                <td className="p-2">{log.sensor.az}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VitalCard({ title, value }) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
      <h3 className="text-slate-400 text-sm uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
