"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function RakshakDashboard() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);

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

  const prediction = current.prediction;

  const isDanger = prediction.status === "DANGER";

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
        <p className="text-slate-400 mt-2 text-lg">Real-Time Multi-Sensor Monitoring System</p>
      </div>

      {/* STATUS CARD */}
      <div
        className={`rounded-2xl p-8 shadow-xl border border-slate-800 transition-all ${
          isDanger
            ? "bg-red-900/40 text-red-300 animate-pulse shadow-red-900/40"
            : "bg-green-900/30 text-green-300 shadow-green-900/20"
        }`}
      >
        <h2 className="text-3xl font-bold flex items-center gap-3">
          {isDanger ? "⚠️ Danger Detected" : "✅ Safe Condition"}
        </h2>

        <p className="mt-2 text-lg">{prediction.reason}</p>

        {prediction.triggeredSensor && (
          <p className="mt-2 text-red-300">
            Triggered Sensor: <b>{prediction.triggeredSensor}</b>
          </p>
        )}

        <p className="mt-3 text-slate-300">
          Updated At: {new Date(current.timestamp).toLocaleString()}
        </p>
      </div>

      {/* SENSOR GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        <VitalCard title="Temperature" value={`${current.sensor.temp} °C`} />
        <VitalCard title="Humidity" value={`${current.sensor.humidity} %`} />
        <VitalCard title="Heart Rate" value={`${current.sensor.bpm} BPM`} />
        <VitalCard title="Blood Oxygen" value={`${current.sensor.spo2} %`} />
        <VitalCard title="Accel X" value={current.sensor.ax} />
        <VitalCard title="Accel Y" value={current.sensor.ay} />
        <VitalCard title="Accel Z" value={current.sensor.az} />
      </div>

      {/* HISTORY */}
      <div className="mt-14 bg-slate-900 p-6 rounded-2xl border border-slate-800 overflow-x-auto">
        <h3 className="text-2xl font-bold mb-4 text-slate-300">
          📜 Sensor Data History (Live)
        </h3>

        <table className="w-full text-left text-slate-300 text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-2">Time</th>
              <th className="p-2">Temp</th>
              <th className="p-2">Humidity</th>
              <th className="p-2">BPM</th>
              <th className="p-2">SpO2</th>
              <th className="p-2">AX</th>
              <th className="p-2">AY</th>
              <th className="p-2">AZ</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {history.map((log, index) => (
              <tr key={index} className="border-b border-slate-800">
                <td className="p-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="p-2">{log.sensor.temp}</td>
                <td className="p-2">{log.sensor.humidity}</td>
                <td className="p-2">{log.sensor.bpm}</td>
                <td className="p-2">{log.sensor.spo2}</td>
                <td className="p-2">{log.sensor.ax}</td>
                <td className="p-2">{log.sensor.ay}</td>
                <td className="p-2">{log.sensor.az}</td>
                <td
                  className={`p-2 font-bold ${
                    log.prediction.status === "DANGER"
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {log.prediction.status}
                </td>
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
