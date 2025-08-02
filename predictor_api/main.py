from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from sklearn.linear_model import LinearRegression

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
    [45, 0, 25, 120, 200, 90],
    [54, 1, 30, 140, 220, 100],
    [37, 0, 28, 110, 180, 85],
    [60, 1, 32, 150, 240, 110],
    [50, 0, 27, 130, 210, 95],
    [65, 1, 35, 160, 260, 120],
    [42, 0, 24, 115, 170, 80],
    [58, 1, 31, 145, 230, 105],
    [39, 0, 26, 125, 190, 88],
    [53, 1, 29, 135, 205, 92],
    [47, 0, 28, 128, 215, 97],
    [62, 1, 33, 155, 250, 115],
    [36, 0, 23, 108, 160, 78],
    [56, 1, 30, 142, 225, 102],
    [41, 0, 25, 118, 175, 83],
])
# Target: risk score (dummy values)
y = np.array([0.7, 0.9, 0.5, 0.95, 0.8, 0.98, 0.45, 0.92, 0.55, 0.85, 0.75, 0.97, 0.42, 0.88, 0.48])

model = LinearRegression().fit(X, y)

class UserData(BaseModel):
    age: int
    gender: str
    bmi: float
    bloodPressure: float
    cholesterol: float
    glucose: float

@app.post("/predict")
async def predict(data: UserData):
    gender_num = 0 if data.gender.lower() == "male" else 1
    features = np.array([[data.age, gender_num, data.bmi, data.bloodPressure, data.cholesterol, data.glucose]])
    print("Received features:", features)
    risk = model.predict(features)[0]
    print("Predicted risk:", risk)
    risk_percent = min(max(risk * 100, 0), 100)
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
