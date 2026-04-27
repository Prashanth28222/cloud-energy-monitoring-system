# ⚡ Energy Monitoring System

A modern, full-stack web application for tracking and analyzing household energy consumption with real-time insights, cost calculation, and energy-saving recommendations.

**Tech Stack:** React (Vite) + Flask (Python) + MongoDB

## 🌟 Features

### 📊 Dashboard
- **Real-time Energy Logging** - Log energy usage instantly
- **Appliance Tracking** - Monitor individual appliance consumption
- **Energy Analysis** - View total usage, daily average, and predictions
- **Appliance Breakdown** - Doughnut chart showing consumption by device

### 📈 Analytics
- **Weekly Summary** - Bar chart visualization of daily usage trends
- **Monthly Summary** - Line chart showing usage patterns throughout the month
- **Cost Breakdown** - See which appliances consume the most energy and cost

### 💰 Cost Management
- **Bill Calculation** - Calculate monthly electricity bills
- **Budget Tracking** - Set and monitor monthly budget limits
- **Cost by Appliance** - Breakdown of costs for each device
- **Budget Alerts** - Warning when approaching budget limit

### 💡 Smart Recommendations
- **Energy Saving Tips** - Personalized suggestions based on usage patterns
- **Peak Hours Alert** - Identify high-consumption periods
- **Device Efficiency Rating** - Know which appliances use the most energy
- **Usage Optimization** - Smart tips to reduce energy consumption

### 📋 Data Management
- **Energy Logs** - View all historical logs
- **CSV Export** - Download energy data for further analysis
- **User Settings** - Customize electricity rate and budget

## 🛠 Tech Stack

### Backend
- **Framework:** Flask (Python)
- **Database:** MongoDB (via `pymongo`)
- **Auth:** JWT (`PyJWT`) + bcrypt (`flask-bcrypt`)
- **API:** RESTful API with CORS support

### Frontend
- **Framework:** React 19 + Vite
- **Charts:** Chart.js via `react-chartjs-2`
- **HTTP Client:** Axios
- **Routing:** React Router v7
- **Styling:** CSS Modules (purple theme)

## 📁 Project Structure

```
cloud-energy-monitoring-system/
├── backend/
│   ├── app.py                # Flask application (MongoDB)
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── api/client.js     # Axios API client
│   │   ├── context/          # Auth context (JWT + localStorage)
│   │   ├── components/       # Header
│   │   └── pages/            # Login, Dashboard
│   ├── .env.example          # Frontend env template
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB (local install or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Start MongoDB

**Local:**
```bash
# Install MongoDB Community Edition, then:
mongod --dbpath /data/db
```

**Atlas (cloud):** Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) and copy the connection string.

---

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Copy and edit environment file
cp backend/.env.example backend/.env
# Edit backend/.env — set MONGODB_URI and JWT_SECRET

# Start the Flask server
python backend/app.py
```

Backend runs at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
# Install Node dependencies
cd frontend
npm install

# Copy and edit environment file
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL if backend is not on localhost:5000

# Start the dev server
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

### Environment Variables

**`backend/.env`** (copy from `.env.example`)
| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/energy_monitoring` | MongoDB connection string |
| `JWT_SECRET` | `dev-secret` | Secret key for JWT tokens — **change in production** |
| `PORT` | `5000` | Flask port |
| `FLASK_DEBUG` | `false` | Enable Flask debug mode |

**`frontend/.env`** (copy from `.env.example`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000` | Backend API base URL |

## 📖 Usage Guide

### 1. **Create Account**
- Click "Register"
- Enter username and password
- Click "Register" button

### 2. **Login**
- Enter your credentials
- Click "Login"

### 3. **Log Energy Usage**
- Enter energy value (kWh)
- Click "Log Energy"
- Data updates automatically

### 4. **Track Appliances**
- Select appliance from dropdown
- Enter energy used
- Click "Log Appliance"
- View breakdown in pie chart

### 5. **Set Electricity Rate**
- Navigate to "Settings & Preferences"
- Enter rate per kWh (₹)
- Click "Save Rate"

### 6. **Set Monthly Budget**
- Enter budget limit (₹)
- Click "Save Budget"
- System tracks remaining budget

### 7. **View Analytics**
- **Weekly Summary:** Bar chart of last 7 days
- **Monthly Summary:** Line chart of current month
- **Bill Calculation:** See monthly costs
- **Recommendations:** Get energy-saving tips

### 8. **Download Data**
- Click "📥 Download CSV"
- Opens file with all your energy logs

## 🔐 Authentication

No default credentials — register a new account via the **Sign Up** tab on the login page.
JWT tokens are stored in `localStorage` and expire after **1 day**.

## 📊 MongoDB Collections

| Collection | Fields |
|---|---|
| `users` | `username`, `password` (bcrypt hash) |
| `energy_logs` | `username`, `kwh`, `timestamp` |
| `appliance_logs` | `username`, `appliance`, `kwh`, `timestamp` |
| `user_settings` | `username`, `electricity_rate`, `monthly_budget` |

## 🎯 API Endpoints

All endpoints (except auth) require `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/signup` — Register new user → `{token, username}`
- `POST /api/login` — Login → `{token, username}`

### Energy
- `POST /api/log-energy` — Body: `{kwh}` → log energy entry
- `GET /api/energy-logs` — Get all logs for current user

### Appliances
- `GET /api/appliances` — List of supported appliances
- `POST /api/log-appliance` — Body: `{appliance, kwh}` → log appliance usage
- `GET /api/appliance-breakdown` — Aggregate kWh per appliance

### Summaries
- `GET /api/weekly-summary` → `{labels, data}` for last 7 days
- `GET /api/monthly-summary` → `{labels, data}` for current month

### Settings
- `GET /api/settings` → `{electricity_rate, monthly_budget}`
- `POST /api/settings/rate` — Body: `{rate}`
- `POST /api/settings/budget` — Body: `{budget}`

### Billing
- `GET /api/billing-summary` → `{total_kwh, rate, bill, budget, remaining}`
- `GET /api/cost-by-appliance` → `{costs: [{appliance, kwh, cost}]}`

## 🐛 Troubleshooting

### Flask won't start
```bash
# Make sure port 5000 is not in use
PORT=5001 python backend/app.py
```

### MongoDB connection error
- Verify MongoDB is running: `mongod --dbpath /data/db`
- Check `MONGODB_URI` in `backend/.env`
- For Atlas, whitelist your IP and verify the connection string

### Login issues
- Clear browser cache / localStorage
- Make sure Flask server is running on the URL set in `frontend/.env`
- Check browser console (F12) for errors

### CORS errors
- Make sure `Flask-CORS` is installed
- Restart Flask server

## 📈 Future Enhancements

- [ ] Email notifications for budget alerts
- [ ] Mobile app (React Native/Flutter)
- [ ] Real IoT device integration
- [ ] Advanced ML predictions
- [ ] Comparative analytics (vs. similar households)
- [ ] Time-based tariff calculations
- [ ] Multi-user household support
- [ ] Dark mode
- [ ] Push notifications
- [ ] API rate limiting

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created by Prashanth28222

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors (F12)
3. Check Flask terminal for backend errors

## 🎉 Acknowledgments

- Flask for backend framework
- Chart.js for beautiful charts
- Modern CSS for responsive design

---

**Happy Energy Tracking! ⚡**
