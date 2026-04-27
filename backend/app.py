import os
from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/energy_monitoring")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
PORT = int(os.getenv("PORT", 5000))

app = Flask(__name__)
CORS(app, origins="*")
bcrypt = Bcrypt(app)

client = MongoClient(MONGODB_URI)
db = client.get_default_database()

users_col = db["users"]
energy_logs_col = db["energy_logs"]
appliance_logs_col = db["appliance_logs"]
settings_col = db["user_settings"]

APPLIANCES = [
    "Air Conditioner", "Refrigerator", "Washing Machine", "Microwave",
    "Television", "Heater", "Lighting", "Computer", "Fan", "Water Heater",
]


def make_token(username: str) -> str:
    payload = {
        "username": username,
        "exp": datetime.now(tz=timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def get_current_user():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, (jsonify({"error": "Missing or invalid token"}), 401)
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["username"], None
    except jwt.ExpiredSignatureError:
        return None, (jsonify({"error": "Token expired"}), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({"error": "Invalid token"}), 401)


# ---------- Auth ----------

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    if users_col.find_one({"username": username}):
        return jsonify({"error": "Username already taken"}), 409
    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    users_col.insert_one({"username": username, "password": pw_hash})
    token = make_token(username)
    return jsonify({"token": token, "username": username}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    user = users_col.find_one({"username": username})
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401
    token = make_token(username)
    return jsonify({"token": token, "username": username})


# ---------- Energy ----------

@app.route("/api/log-energy", methods=["POST"])
def log_energy():
    username, err = get_current_user()
    if err:
        return err
    data = request.get_json() or {}
    kwh = data.get("kwh")
    if kwh is None:
        return jsonify({"error": "kwh required"}), 400
    doc = {"username": username, "kwh": float(kwh), "timestamp": datetime.utcnow()}
    result = energy_logs_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["timestamp"] = doc["timestamp"].isoformat()
    return jsonify({"message": "Energy logged", "log": doc})


@app.route("/api/energy-logs", methods=["GET"])
def energy_logs():
    username, err = get_current_user()
    if err:
        return err
    cursor = energy_logs_col.find({"username": username}).sort("timestamp", -1)
    logs = [
        {"id": str(d["_id"]), "kwh": d["kwh"], "timestamp": d["timestamp"].isoformat()}
        for d in cursor
    ]
    return jsonify({"logs": logs})


# ---------- Appliances ----------

@app.route("/api/appliances", methods=["GET"])
def get_appliances():
    username, err = get_current_user()
    if err:
        return err
    return jsonify(APPLIANCES)


@app.route("/api/log-appliance", methods=["POST"])
def log_appliance():
    username, err = get_current_user()
    if err:
        return err
    data = request.get_json() or {}
    appliance = data.get("appliance")
    kwh = data.get("kwh")
    if not appliance or kwh is None:
        return jsonify({"error": "appliance and kwh required"}), 400
    doc = {
        "username": username,
        "appliance": appliance,
        "kwh": float(kwh),
        "timestamp": datetime.utcnow(),
    }
    result = appliance_logs_col.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["timestamp"] = doc["timestamp"].isoformat()
    return jsonify({"message": "Appliance logged", "log": doc})


@app.route("/api/appliance-breakdown", methods=["GET"])
def appliance_breakdown():
    username, err = get_current_user()
    if err:
        return err
    pipeline = [
        {"$match": {"username": username}},
        {"$group": {"_id": "$appliance", "total_kwh": {"$sum": "$kwh"}}},
        {"$sort": {"total_kwh": -1}},
    ]
    breakdown = [
        {"appliance": r["_id"], "total_kwh": r["total_kwh"]}
        for r in appliance_logs_col.aggregate(pipeline)
    ]
    return jsonify({"breakdown": breakdown})


# ---------- Summaries ----------

@app.route("/api/weekly-summary", methods=["GET"])
def weekly_summary():
    username, err = get_current_user()
    if err:
        return err
    now = datetime.utcnow()
    labels = []
    data = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        total = sum(
            d["kwh"]
            for d in energy_logs_col.find(
                {"username": username, "timestamp": {"$gte": day_start, "$lt": day_end}}
            )
        )
        labels.append(day.strftime("%a"))
        data.append(round(total, 3))
    return jsonify({"labels": labels, "data": data})


@app.route("/api/monthly-summary", methods=["GET"])
def monthly_summary():
    username, err = get_current_user()
    if err:
        return err
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    import calendar
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    labels = []
    data = []
    for day_num in range(1, days_in_month + 1):
        day_start = month_start.replace(day=day_num)
        day_end = day_start + timedelta(days=1)
        total = sum(
            d["kwh"]
            for d in energy_logs_col.find(
                {"username": username, "timestamp": {"$gte": day_start, "$lt": day_end}}
            )
        )
        labels.append(str(day_num))
        data.append(round(total, 3))
    return jsonify({"labels": labels, "data": data})


# ---------- Settings ----------

def get_user_settings(username):
    s = settings_col.find_one({"username": username}) or {}
    return {
        "electricity_rate": s.get("electricity_rate", 6.5),
        "monthly_budget": s.get("monthly_budget", 1000),
    }


@app.route("/api/settings", methods=["GET"])
def get_settings():
    username, err = get_current_user()
    if err:
        return err
    return jsonify(get_user_settings(username))


@app.route("/api/settings/rate", methods=["POST"])
def save_rate():
    username, err = get_current_user()
    if err:
        return err
    data = request.get_json() or {}
    rate = data.get("rate")
    if rate is None:
        return jsonify({"error": "rate required"}), 400
    settings_col.update_one(
        {"username": username},
        {"$set": {"electricity_rate": float(rate)}},
        upsert=True,
    )
    return jsonify({"message": "Rate saved", "rate": float(rate)})


@app.route("/api/settings/budget", methods=["POST"])
def save_budget():
    username, err = get_current_user()
    if err:
        return err
    data = request.get_json() or {}
    budget = data.get("budget")
    if budget is None:
        return jsonify({"error": "budget required"}), 400
    settings_col.update_one(
        {"username": username},
        {"$set": {"monthly_budget": float(budget)}},
        upsert=True,
    )
    return jsonify({"message": "Budget saved", "budget": float(budget)})


# ---------- Billing ----------

@app.route("/api/billing-summary", methods=["GET"])
def billing_summary():
    username, err = get_current_user()
    if err:
        return err
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    total_kwh = sum(
        d["kwh"]
        for d in energy_logs_col.find(
            {"username": username, "timestamp": {"$gte": month_start}}
        )
    )
    settings = get_user_settings(username)
    rate = settings["electricity_rate"]
    budget = settings["monthly_budget"]
    bill = round(total_kwh * rate, 2)
    remaining = round(budget - bill, 2)
    return jsonify({
        "total_kwh": round(total_kwh, 3),
        "rate": rate,
        "bill": bill,
        "budget": budget,
        "remaining": remaining,
    })


@app.route("/api/cost-by-appliance", methods=["GET"])
def cost_by_appliance():
    username, err = get_current_user()
    if err:
        return err
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    settings = get_user_settings(username)
    rate = settings["electricity_rate"]
    pipeline = [
        {"$match": {"username": username, "timestamp": {"$gte": month_start}}},
        {"$group": {"_id": "$appliance", "kwh": {"$sum": "$kwh"}}},
        {"$sort": {"kwh": -1}},
    ]
    costs = [
        {
            "appliance": r["_id"],
            "kwh": round(r["kwh"], 3),
            "cost": round(r["kwh"] * rate, 2),
        }
        for r in appliance_logs_col.aggregate(pipeline)
    ]
    return jsonify({"costs": costs})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=PORT)