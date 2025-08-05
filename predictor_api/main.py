from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib
import json
import os
from tensorflow.keras.models import load_model

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your pre-trained deep learning model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "dog_disease_model.h5")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.save")
model = load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

class UserData(BaseModel):
    age: float
    sex: float
    cp: float
    trestbps: float
    chol: float
    fbs: float
    restecg: float
    thalach: float
    exang: float
    oldpeak: float
    slope: float
    ca: float
    thal: float

class SymptomData(BaseModel):
    symptoms: list[str]

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
    "sore throat": "ENT Doctors"
}

DOCTORS_PATH = os.path.join(os.path.dirname(__file__), '..', 'pr_doctors.json')
try:
    with open(DOCTORS_PATH, 'r', encoding='utf-8') as f:
        doctors_data = json.load(f)
except Exception as e:
    print(f"Error loading doctors data: {e}")
    doctors_data = []

@app.post("/recommend-doctor")
async def recommend_doctor(data: SymptomData):
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
    # Validate all fields in UserData
    input_fields = {
        "age": data.age,
        "sex": data.sex,
        "cp": data.cp,
        "trestbps": data.trestbps,
        "chol": data.chol,
        "fbs": data.fbs,
        "restecg": data.restecg,
        "thalach": data.thalach,
        "exang": data.exang,
        "oldpeak": data.oldpeak,
        "slope": data.slope,
        "ca": data.ca,
        "thal": data.thal
    }
    for k, v in input_fields.items():
        if v is None or not isinstance(v, (int, float)):
            return {
                "prediction": f"Invalid input: {k} must be a number.",
                "advice": "Please fill in all fields with valid numeric values.",
                "details": {}
            }
    features = np.array([[
        data.age,
        data.sex,
        data.cp,
        data.trestbps,
        data.chol,
        data.fbs,
        data.restecg,
        data.thalach,
        data.exang,
        data.oldpeak,
        data.slope,
        data.ca,
        data.thal
    ]])

    scaled_features = scaler.transform(features)
    prediction = model.predict(scaled_features)[0][0]

    risk_clamped = min(max(prediction, 0), 1)
    risk_percent = risk_clamped * 100

    # Confidence score: for regression, use proximity to nearest risk category as a proxy
    if risk_percent < 30:
        advice = "Your risk is low. Maintain a healthy lifestyle with regular exercise and balanced diet."
        confidence = 1 - abs(risk_percent/100 - 0.15)  # closer to 15% (midpoint of low)
    elif risk_percent < 60:
        advice = "Your risk is moderate. Consider regular checkups, monitor your health parameters."
        confidence = 1 - abs(risk_percent/100 - 0.45)  # closer to 45% (midpoint of moderate)
    else:
        advice = "Your risk is high. Consult a healthcare professional, consider lifestyle changes, and follow medical advice."
        confidence = 1 - abs(risk_percent/100 - 0.80)  # closer to 80% (midpoint of high)

    confidence = max(min(confidence, 1), 0)

    return {
        "prediction": f"Estimated risk: {risk_percent:.1f}%",
        "advice": advice,
        "confidence": f"{confidence*100:.1f}%",
        "details": input_fields
    }

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
    "sore throat": "ENT Doctors"
}

DOCTORS_PATH = os.path.join(os.path.dirname(__file__), '..', 'pr_doctors.json')
try:
    with open(DOCTORS_PATH, 'r', encoding='utf-8') as f:
        doctors_data = json.load(f)
except Exception as e:
    print(f"Error loading doctors data: {e}")
    doctors_data = []

@app.post("/recommend-doctor")
async def recommend_doctor(data: SymptomData):
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
    gender_num = 0 if data.sex == 1 else 1
    input_fields = {
        "age": data.age,
        "bmi": data.bmi,
        "bloodPressure": data.bloodPressure,
        "cholesterol": data.cholesterol,
        "glucose": data.glucose
    }
    for k, v in input_fields.items():
        if v is None or not isinstance(v, (int, float)) or v <= 0:
            return {
                "prediction": f"Invalid input: {k} must be a positive number.",
                "advice": "Please fill in all fields with valid values.",
                "details": {}
            }
    features = np.array([[
        data.age,
        gender_num,
        data.bmi,
        data.bloodPressure,
        data.cholesterol,
        data.glucose
    ]])

    scaled_features = scaler.transform(features)
    prediction = model.predict(scaled_features)[0][0]

    risk_clamped = min(max(prediction, 0), 1)
    risk_percent = risk_clamped * 100

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
