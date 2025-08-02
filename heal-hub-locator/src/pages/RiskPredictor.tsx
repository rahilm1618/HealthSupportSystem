import React, { useState } from "react";
import Header from '../components/Header.tsx'
interface FormData {
  age: number;
  gender: string;
  bmi: number;
  bloodPressure: number;
  cholesterol: number;
  glucose: number;
}

const initialState: FormData = {
  age: undefined as any,
  gender: "male",
  bmi: undefined as any,
  bloodPressure: undefined as any,
  cholesterol: undefined as any,
  glucose: undefined as any,
};

export default function RiskPredictor() {
  const [form, setForm] = useState<FormData>(initialState);
  const [result, setResult] = useState<React.ReactNode>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "age" || name === "bmi" || name === "bloodPressure" || name === "cholesterol" || name === "glucose" ? (value === "" ? undefined : Number(value)) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    // Frontend validation: check all fields
    if (
      !form.age || !form.bmi || !form.bloodPressure || !form.cholesterol || !form.glucose || !form.gender
    ) {
      setResult(<div className="text-red-600 font-semibold">Please fill in all fields before submitting.</div>);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      // Suggestion logic based on risk_percent
      let suggestions = [];
      const riskPercent = parseFloat(data.prediction.replace(/[^\d.]/g, ""));
      if (riskPercent < 30) {
        suggestions = [
          "Maintain a balanced diet rich in fruits, vegetables, and whole grains.",
          "Exercise regularly (at least 150 minutes per week).",
          "Avoid smoking and limit alcohol consumption.",
          "Get regular sleep and manage stress."
        ];
      } else if (riskPercent < 60) {
        suggestions = [
          "Monitor your blood pressure, cholesterol, and glucose regularly.",
          "Reduce salt and sugar intake.",
          "Increase physical activity and maintain a healthy weight.",
          "Consider consulting a nutritionist for a personalized diet plan."
        ];
      } else {
        suggestions = [
          "Consult a healthcare professional for a detailed assessment.",
          "Follow prescribed medications and treatment plans.",
          "Adopt a heart-healthy diet and reduce saturated fats.",
          "Engage in regular, moderate exercise as advised by your doctor.",
          "Join support groups or counseling for lifestyle changes."
        ];
      }
      setResult(
        <div>
          <div className="text-xl font-semibold mb-2">{data.prediction}</div>
          <div className="mb-2 text-blue-700 font-medium">Advice: {data.advice}</div>
          <div className="bg-green-50 p-2 rounded text-sm mt-2">
            <div className="font-semibold mb-1">Suggestions to reduce your risk:</div>
            <ul className="list-disc ml-5">
              {suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      );
    } catch (err) {
      setResult("Error connecting to prediction service.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-blue-100 ">
        <Header />
        <div className="mb-8" />
        <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center drop-shadow">Health Risk Predictor</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Age</label>
            <input type="number" name="age" value={form.age ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block font-medium">BMI</label>
            <input type="number" name="bmi" value={form.bmi ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} step={0.1} />
            <div className="text-xs text-gray-500">
              <span className="font-semibold">Healthy:</span> 18.5-24.9 &nbsp;|&nbsp;
              <span className="font-semibold">Moderate:</span> 25-29.9 &nbsp;|&nbsp;
              <span className="font-semibold">High:</span> 30+
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Blood Pressure</label>
            <input type="number" name="bloodPressure" value={form.bloodPressure ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} />
            <div className="text-xs text-gray-500">
              <span className="font-semibold">Healthy:</span> 90-120 mmHg &nbsp;|&nbsp;
              <span className="font-semibold">Moderate:</span> 121-139 mmHg &nbsp;|&nbsp;
              <span className="font-semibold">High:</span> 140+ mmHg
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Cholesterol</label>
            <input type="number" name="cholesterol" value={form.cholesterol ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} />
            <div className="text-xs text-gray-500">
              <span className="font-semibold">Healthy:</span> &lt;200 mg/dL &nbsp;|&nbsp;
              <span className="font-semibold">Moderate:</span> 200-239 mg/dL &nbsp;|&nbsp;
              <span className="font-semibold">High:</span> 240+ mg/dL
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block font-medium">Glucose</label>
            <input type="number" name="glucose" value={form.glucose ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} />
            <div className="text-xs text-gray-500">
              <span className="font-semibold">Healthy:</span> 70-99 mg/dL &nbsp;|&nbsp;
              <span className="font-semibold">Moderate:</span> 100-125 mg/dL &nbsp;|&nbsp;
              <span className="font-semibold">High:</span> 126+ mg/dL
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-green-600 transition-colors" disabled={loading}>
            {loading ? "Predicting..." : "Predict Risk"}
          </button>
        </form>
        {result && <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">{result}</div>}
      </div>
    </div>
  );
}
