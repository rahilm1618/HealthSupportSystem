// import React, { useState } from "react";
// import Header from '../components/Header.tsx'
// interface FormData {
//   age: number;
//   gender: string;
//   bmi: number;
//   bloodPressure: number;
//   cholesterol: number;
//   glucose: number;
// }

// const initialState: FormData = {
//   age: undefined as any,
//   gender: "male",
//   bmi: undefined as any,
//   bloodPressure: undefined as any,
//   cholesterol: undefined as any,
//   glucose: undefined as any,
// };

// export default function RiskPredictor() {
//   const [form, setForm] = useState<FormData>(initialState);
//   const [result, setResult] = useState<React.ReactNode>("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: name === "age" || name === "bmi" || name === "bloodPressure" || name === "cholesterol" || name === "glucose" ? (value === "" ? undefined : Number(value)) : value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setResult("");
//     // Frontend validation: check all fields
//     if (
//       !form.age || !form.bmi || !form.bloodPressure || !form.cholesterol || !form.glucose || !form.gender
//     ) {
//       setResult(<div className="text-red-600 font-semibold">Please fill in all fields before submitting.</div>);
//       setLoading(false);
//       return;
//     }
//     try {
//       const response = await fetch("http://localhost:8000/predict", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       const data = await response.json();
//       // Suggestion logic based on risk_percent
//       let suggestions = [];
//       const riskPercent = parseFloat(data.prediction.replace(/[^\d.]/g, ""));
//       if (riskPercent < 30) {
//         suggestions = [
//           "Maintain a balanced diet rich in fruits, vegetables, and whole grains.",
//           "Exercise regularly (at least 150 minutes per week).",
//           "Avoid smoking and limit alcohol consumption.",
//           "Get regular sleep and manage stress."
//         ];
//       } else if (riskPercent < 60) {
//         suggestions = [
//           "Monitor your blood pressure, cholesterol, and glucose regularly.",
//           "Reduce salt and sugar intake.",
//           "Increase physical activity and maintain a healthy weight.",
//           "Consider consulting a nutritionist for a personalized diet plan."
//         ];
//       } else {
//         suggestions = [
//           "Consult a healthcare professional for a detailed assessment.",
//           "Follow prescribed medications and treatment plans.",
//           "Adopt a heart-healthy diet and reduce saturated fats.",
//           "Engage in regular, moderate exercise as advised by your doctor.",
//           "Join support groups or counseling for lifestyle changes."
//         ];
//       }
//       setResult(
//         <div>
//           <div className="text-xl font-semibold mb-2">{data.prediction}</div>
//           <div className="mb-2 text-blue-700 font-medium">Advice: {data.advice}</div>
//           <div className="bg-green-50 p-2 rounded text-sm mt-2">
//             <div className="font-semibold mb-1">Suggestions to reduce your risk:</div>
//             <ul className="list-disc ml-5">
//               {suggestions.map((s, i) => <li key={i}>{s}</li>)}
//             </ul>
//           </div>
//         </div>
//       );
//     } catch (err) {
//       setResult("Error connecting to prediction service.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white">
//       <div className="max-w-md w-full mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-blue-100 ">
//         <Header />
//         <div className="mb-8" />
//         <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center drop-shadow">Health Risk Predictor</h2>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
//           <div className="flex flex-col gap-2">
//             <label className="block font-medium">Age</label>
//             <input type="number" name="age" value={form.age ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} />
//           </div>
//           <div className="flex flex-col gap-2">
//             <label className="block font-medium">Gender</label>
//             <select name="gender" value={form.gender} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300">
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//             </select>
//           </div>
//           <div className="flex flex-col gap-2">
//             <label className="block font-medium">BMI</label>
//             <input type="number" name="bmi" value={form.bmi ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} step={0.1} />
//             <div className="text-xs text-gray-500">
//               <span className="font-semibold">Healthy:</span> 18.5-24.9 &nbsp;|&nbsp;
//               <span className="font-semibold">Moderate:</span> 25-29.9 &nbsp;|&nbsp;
//               <span className="font-semibold">High:</span> 30+
//             </div>
//           </div>
//           <div className="flex flex-col gap-2">
//             <label className="block font-medium">Blood Pressure</label>
//             <input type="number" name="bloodPressure" value={form.bloodPressure ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} />
//             <div className="text-xs text-gray-500">
//               <span className="font-semibold">Healthy:</span> 90-120 mmHg &nbsp;|&nbsp;
//               <span className="font-semibold">Moderate:</span> 121-139 mmHg &nbsp;|&nbsp;
//               <span className="font-semibold">High:</span> 140+ mmHg
//             </div>
//           </div>
//           <div className="flex flex-col gap-2">
//             <label className="block font-medium">Cholesterol</label>
//             <input type="number" name="cholesterol" value={form.cholesterol ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} />
//             <div className="text-xs text-gray-500">
//               <span className="font-semibold">Healthy:</span> &lt;200 mg/dL &nbsp;|&nbsp;
//               <span className="font-semibold">Moderate:</span> 200-239 mg/dL &nbsp;|&nbsp;
//               <span className="font-semibold">High:</span> 240+ mg/dL
//             </div>
//           </div>
//           <div className="flex flex-col gap-2">
//             <label className="block font-medium">Glucose</label>
//             <input type="number" name="glucose" value={form.glucose ?? ""} onChange={handleChange} className="border px-3 py-2 rounded focus:ring-2 focus:ring-blue-300" required min={1} />
//             <div className="text-xs text-gray-500">
//               <span className="font-semibold">Healthy:</span> 70-99 mg/dL &nbsp;|&nbsp;
//               <span className="font-semibold">Moderate:</span> 100-125 mg/dL &nbsp;|&nbsp;
//               <span className="font-semibold">High:</span> 126+ mg/dL
//             </div>
//           </div>
//           <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-green-600 transition-colors" disabled={loading}>
//             {loading ? "Predicting..." : "Predict Risk"}
//           </button>
//         </form>
//         {result && <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">{result}</div>}
//       </div>
//     </div>
//   );
// }
import Header from "@/components/Header";
import { useState } from "react";
import axios from "axios";

interface FormData {
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
}

const initialState: FormData = {
  age: 0,
  sex: 1,
  cp: 0,
  trestbps: 120,
  chol: 200,
  fbs: 0,
  restecg: 0,
  thalach: 150,
  exang: 0,
  oldpeak: 1.0,
  slope: 1,
  ca: 0,
  thal: 1,
};

export default function PredictorForm() {
  const [form, setForm] = useState<FormData>(initialState);
  const [result, setResult] = useState<null | { prediction: string; advice: string; confidence: string }>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: parseFloat(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", form);
      const { prediction, advice, confidence } = response.data;
      setResult({ prediction, advice, confidence });
    } catch (err) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-3xl w-full mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-blue-100 mt-24">
        <Header />
        <h1 className="text-4xl font-extrabold mb-2 text-blue-700 text-center drop-shadow flex items-center justify-center gap-2">
          <span role="img" aria-label="heart">❤️</span> Heart Disease Risk Predictor
        </h1>
        <p className="text-gray-600 text-center mb-8">Fill in your details to estimate your risk. All fields are required.</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 text-lg font-semibold text-blue-600 mb-2">Personal Information</div>
          <div>
            <label className="block text-sm font-semibold mb-2">Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} min={1} max={120} required className="w-full border-2 border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Sex</label>
            <select name="sex" value={form.sex} onChange={handleChange} required className="w-full border-2 border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 transition">
              <option value={1}>Male</option>
              <option value={0}>Female</option>
            </select>
          </div>
          <div className="col-span-2 text-lg font-semibold text-blue-600 mt-4 mb-2">Medical Parameters</div>
          <div>
            <label className="block text-sm font-semibold mb-2">Chest Pain Type (cp)</label>
            <input type="number" name="cp" value={form.cp} onChange={handleChange} min={0} max={3} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> 0 (Typical Angina) &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 1-2 (Atypical/Non-anginal) &nbsp;|&nbsp; <span className="font-semibold">High:</span> 3 (Asymptomatic)
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Resting Blood Pressure (trestbps)</label>
            <input type="number" name="trestbps" value={form.trestbps} onChange={handleChange} min={80} max={200} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> &lt;90 mmHg &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 90-120 mmHg &nbsp;|&nbsp; <span className="font-semibold">High:</span> 140+ mmHg
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Cholesterol (chol)</label>
            <input type="number" name="chol" value={form.chol} onChange={handleChange} min={100} max={400} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> &lt;150 mg/dL &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 150-200 mg/dL &nbsp;|&nbsp; <span className="font-semibold">High:</span> 240+ mg/dL
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Fasting Blood Sugar (fbs)</label>
            <input type="number" name="fbs" value={form.fbs} onChange={handleChange} min={0} max={1} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> &lt;70 mg/dL &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 70-99 mg/dL &nbsp;|&nbsp; <span className="font-semibold">High:</span> 126+ mg/dL
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Rest ECG (restecg)</label>
            <input type="number" name="restecg" value={form.restecg} onChange={handleChange} min={0} max={2} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> 0 (Normal) &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 1 (ST-T abnormality) &nbsp;|&nbsp; <span className="font-semibold">High:</span> 2 (LV hypertrophy)
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Max Heart Rate (thalach)</label>
            <input type="number" name="thalach" value={form.thalach} onChange={handleChange} min={60} max={220} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> &lt;100 bpm &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 100-170 bpm &nbsp;|&nbsp; <span className="font-semibold">High:</span> 170+ bpm
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Exercise Induced Angina (exang)</label>
            <input type="number" name="exang" value={form.exang} onChange={handleChange} min={0} max={1} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> 0 (No) &nbsp;|&nbsp; <span className="font-semibold">High:</span> 1 (Yes)
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Oldpeak</label>
            <input type="number" name="oldpeak" value={form.oldpeak} onChange={handleChange} min={0} max={6} step={0.1} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> 0 &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 0-1 &nbsp;|&nbsp; <span className="font-semibold">High:</span> 2+
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Slope</label>
            <input type="number" name="slope" value={form.slope} onChange={handleChange} min={0} max={2} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> 0 (Upsloping) &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 1 (Flat) &nbsp;|&nbsp; <span className="font-semibold">High:</span> 2 (Downsloping)
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">CA</label>
            <input type="number" name="ca" value={form.ca} onChange={handleChange} min={0} max={4} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> 0 &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 0 &nbsp;|&nbsp; <span className="font-semibold">High:</span> 1-4
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Thal</label>
            <input type="number" name="thal" value={form.thal} onChange={handleChange} min={0} max={3} required className="w-full border-2 border-green-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 transition" />
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Low:</span> 1 (Normal) &nbsp;|&nbsp; <span className="font-semibold">Healthy:</span> 2 (Fixed Defect) &nbsp;|&nbsp; <span className="font-semibold">High:</span> 3 (Reversible Defect)
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="col-span-2 mt-6 bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-green-600 transition-colors text-lg flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin mr-2">🔄</span> : <span>🩺</span>}
            {loading ? "Predicting..." : "Predict Risk"}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-6 border-2 border-blue-200 rounded-2xl bg-blue-50 text-center shadow">
            <div className="text-2xl font-bold mb-2 text-blue-800">{result.prediction}</div>
            <div className="mb-2 text-blue-700 font-medium">Advice: {result.advice}</div>
            <div className="mb-2 text-green-700 font-medium">Confidence: {result.confidence}</div>
          </div>
        )}
      </div>
    </div>
  );
}

