from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Fake data (we'll use database later)
users = {
    "user1": {"password": "pass123", "energy_logs": []}
}

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username in users and users[username]['password'] == password:
        return jsonify({"message": "Login successful", "user": username})
    return jsonify({"message": "Invalid credentials"}), 401

# Log energy usage
@app.route('/log-energy', methods=['POST'])
def log_energy():
    data = request.json
    username = data.get('username')
    kwh = data.get('kwh')
    
    if username in users:
        users[username]['energy_logs'].append(kwh)
        return jsonify({"message": "Energy logged", "kwh": kwh})
    return jsonify({"message": "User not found"}), 404

# Get user energy logs
@app.route('/energy-logs/<username>', methods=['GET'])
def get_logs(username):
    if username in users:
        return jsonify({"logs": users[username]['energy_logs']})
    return jsonify({"message": "User not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)