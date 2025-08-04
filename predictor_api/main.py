from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import numpy as np
from sklearn.linear_model import LinearRegression
import json
import os

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy training data 
# Features: age, gender (0=male, 1=female), bmi, bloodPressure, cholesterol, glucose
X = np.array([
    [25, 0, 22.0, 110, 170, 85], [30, 1, 24.5, 115, 180, 90], [35, 0, 26.0, 120, 190, 95], [40, 1, 28.0, 125, 200, 100],
    [45, 0, 30.0, 130, 210, 105], [50, 1, 32.0, 135, 220, 110], [55, 0, 34.0, 140, 230, 115], [60, 1, 36.0, 145, 240, 120],
    [65, 0, 38.0, 150, 250, 125], [70, 1, 40.0, 155, 260, 130], [28, 0, 23.0, 112, 175, 88], [33, 1, 25.0, 118, 185, 92],
    [48, 0, 31.0, 132, 215, 108], [53, 1, 33.0, 138, 225, 112], [58, 0, 35.0, 143, 235, 118], [63, 1, 37.0, 148, 245, 123],
    [68, 0, 39.0, 153, 255, 128], [73, 1, 41.0, 158, 265, 133], [38, 0, 27.0, 122, 195, 98], [43, 1, 29.0, 127, 205, 103],
    [53, 0, 33.0, 137, 225, 113], [63, 1, 37.0, 147, 245, 123], [29, 0, 24.0, 113, 178, 89], [34, 1, 26.0, 119, 188, 93],
    [49, 0, 32.0, 133, 218, 109], [54, 1, 34.0, 139, 228, 114], [59, 0, 36.0, 144, 238, 119], [64, 1, 38.0, 149, 248, 124],
    [69, 0, 40.0, 154, 258, 129], [74, 1, 42.0, 159, 268, 134],
    # Expanded samples
    [22, 0, 20.0, 105, 160, 80], [27, 1, 23.0, 112, 175, 87], [32, 0, 25.0, 118, 185, 91], [37, 1, 27.0, 124, 195, 96],
    [42, 0, 29.0, 130, 205, 101], [47, 1, 31.0, 136, 215, 106], [52, 0, 33.0, 142, 225, 111], [57, 1, 35.0, 148, 235, 116],
    [62, 0, 37.0, 154, 245, 121], [67, 1, 39.0, 160, 255, 126], [72, 0, 41.0, 166, 265, 131], [77, 1, 43.0, 172, 275, 136],
    [26, 0, 21.0, 108, 168, 83], [31, 1, 24.0, 114, 178, 89], [36, 0, 27.0, 120, 188, 94], [41, 1, 30.0, 126, 198, 99],
    [46, 0, 33.0, 132, 208, 104], [51, 1, 36.0, 138, 218, 109], [56, 0, 39.0, 144, 228, 114], [61, 1, 42.0, 150, 238, 119],
    [66, 0, 45.0, 156, 248, 124], [71, 1, 48.0, 162, 258, 129], [76, 0, 51.0, 168, 268, 134], [81, 1, 54.0, 174, 278, 139],
    [24, 0, 22.0, 110, 172, 86], [39, 1, 28.0, 123, 193, 97], [59, 0, 37.0, 145, 239, 120], [79, 1, 44.0, 170, 273, 137]
])
y = np.array([
    0.15, 0.18, 0.22, 0.27, 0.33, 0.39, 0.45, 0.52, 0.60, 0.68,
    0.17, 0.20, 0.35, 0.41, 0.48, 0.55, 0.63, 0.71, 0.25, 0.30,
    0.41, 0.55, 0.19, 0.23, 0.37, 0.43, 0.50, 0.57, 0.65, 0.73,
    # Expanded risk scores (now strictly increasing with cholesterol)
    0.12, 0.16, 0.21, 0.26, 0.32, 0.38, 0.44, 0.51, 0.59, 0.67, 0.75, 0.83,
    0.14, 0.19, 0.24, 0.29, 0.35, 0.41, 0.47, 0.54, 0.62, 0.70, 0.78, 0.86,
    0.13, 0.28, 0.58, 0.90
])

model = LinearRegression().fit(X, y)

print("Model coefficients:", model.coef_)
print("Model intercept:", model.intercept_)


class UserData(BaseModel):
    age: int
    gender: str
    bmi: float
    bloodPressure: float
    cholesterol: float
    glucose: float

# For symptom checker
class SymptomData(BaseModel):
    symptoms: list[str]


# Simple mapping of symptoms to specialties
SYMPTOM_SPECIALTY_MAP = {
    "fever": "General Physician Doctors",
    "cough": "Pulmonologists Doctors",
    "headache": "Neurology",
    "chest pain": "Cardiologists",
    "skin rash": "Dermatologists",
    "joint pain": "Orthopaedic",
    "stomach pain": "Gastroenterologists",
    "eye pain": "Ophthalmologists",
    "toothache": "Dentist",
    "anxiety": "Psychiatrist",
    "diabetes": "Endocrinologist",
    "high blood pressure": "Cardiologists",
    "asthma": "Pulmonologists Doctors",
    "allergy": "Allergist",
    "ear pain": "ENT Doctors",
    "back pain": "Orthopaedic",
    "cold": "General Physician Doctors",
    "vomiting": "Gastroenterologists",
    "diarrhea": "Gastroenterologists",
    "sore throat": "ENT Doctors",
}

# Load doctors from pr_doctors.json
DOCTORS_PATH = os.path.join(os.path.dirname(__file__), '..', 'pr_doctors.json')
try:
    with open(DOCTORS_PATH, 'r', encoding='utf-8') as f:
        doctors_data = json.load(f)
except Exception as e:
    print(f"Error loading doctors data: {e}")
    doctors_data = []


@app.post("/recommend-doctor")
async def recommend_doctor(data: SymptomData):
    print("Received symptoms:", data.symptoms)
    specialties = set()
    for symptom in data.symptoms:
        specialty = SYMPTOM_SPECIALTY_MAP.get(symptom.lower())
        if specialty:
            specialties.add(specialty)
    if not specialties:
        return {
            "recommendation": "No matching specialty found. Please consult a General Physician.",
            "specialties": [],
            "doctors": []
        }
    # Find doctors matching any of the recommended specialties
    matching_doctors = [
        {
            "name": d.get("name"),
            "speciality": d.get("speciality"),
            "contact": d.get("contact"),
            "location": d.get("location"),
            "doctor_rating": d.get("doctor_rating", {}).get("$numberDecimal", "")
        }
        for d in doctors_data if d.get("speciality") in specialties
    ]
    return {
        "recommendation": f"Recommended specialties: {', '.join(specialties)}",
        "specialties": list(specialties),
        "doctors": matching_doctors
    }

@app.post("/predict")
async def predict(data: UserData):
    print("Received request data:", data)
    # Gender encoding
    gender_num = 0 if data.gender.lower() == "male" else 1
    # Robust input validation
    input_fields = {
        "age": data.age,
        "bmi": data.bmi,
        "bloodPressure": data.bloodPressure,
        "cholesterol": data.cholesterol,
        "glucose": data.glucose
    }
    for k, v in input_fields.items():
        if v is None or not isinstance(v, (int, float)) or v <= 0:
            print(f"Invalid value for {k}: {v}")
            return {
                "prediction": f"Invalid input: {k} must be a positive number.",
                "advice": "Please fill in all fields with valid values.",
                "details": {}
            }
    features = np.array([[data.age, gender_num, data.bmi, data.bloodPressure, data.cholesterol, data.glucose]])
    print(f"Received data: age={data.age}, gender={data.gender}, bmi={data.bmi}, bloodPressure={data.bloodPressure}, cholesterol={data.cholesterol}, glucose={data.glucose}")
    print("Feature array for prediction:", features)
    risk = model.predict(features)[0]
    print("Predicted risk (raw):", risk)
    # Clamp risk to [0, 1] before converting to percent
    if risk < 0 or risk > 1:
        print("Warning: raw risk outside [0, 1] range. Clamping.")
    risk_clamped = min(max(risk, 0), 1)
    risk_percent = risk_clamped * 100
    print("Predicted risk (percent):", risk_percent)
    advice = ""
    if risk_percent < 30:
        advice = "Your risk is low. Maintain a healthy lifestyle with regular exercise and balanced diet."
    elif risk_percent < 60:
        advice = "Your risk is moderate. Consider regular checkups, monitor your blood pressure, cholesterol, and glucose levels."
    else:
        advice = "Your risk is high. Consult a healthcare professional, consider lifestyle changes, and follow medical advice."
    return {
        "prediction": f"Estimated risk: {risk_percent:.1f}%",
        "advice": advice,
        "details": {
            "age": data.age,
            "gender": data.gender,
            "bmi": data.bmi,
            "bloodPressure": data.bloodPressure,
            "cholesterol": data.cholesterol,
            "glucose": data.glucose
        }
    }
