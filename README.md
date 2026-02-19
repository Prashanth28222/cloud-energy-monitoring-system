# cloud-energy-monitoring-system
This is a personal cloud project to monitor energy usage using AWS it focuses on cloud architecture,storage and reporting
# ⚡ Energy Monitoring System

A modern, full-stack web application for tracking and analyzing household energy consumption with real-time insights, cost calculation, and energy-saving recommendations.

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
- **Database:** SQLite3
- **API:** RESTful API with CORS support
- **Features:** User authentication, data analysis, cost calculation

### Frontend
- **HTML5, CSS3, JavaScript**
- **Chart Library:** Chart.js
- **Styling:** Modern gradient design with responsive layout
- **Features:** Real-time updates, modern UI/UX

## 📁 Project Structure

```
energy-monitoring/
│
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── energy.db              # SQLite database
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   └── index.html             # Single-page application
│
└── README.md                  # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- pip (Python package manager)

### Installation

1. **Clone or download the project**
```bash
cd energy-monitoring
```

2. **Install Python dependencies**
```bash
pip install -r backend/requirements.txt
```

Or install manually:
```bash
pip install flask flask-cors
```

3. **Start the Flask server**
```bash
python backend/app.py
```

4. **Open in browser**
```
http://127.0.0.1:5000
```

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

### Default Test Credentials
```
Username: testuser
Password: test123
```

You can create your own account by registering!

## 📊 Database Schema

### Users Table
```
id: INTEGER PRIMARY KEY
username: TEXT UNIQUE
password: TEXT
created_at: TIMESTAMP
```

### Energy Logs Table
```
id: INTEGER PRIMARY KEY
username: TEXT
energy_usage: REAL (kWh)
timestamp: TIMESTAMP
```

### Appliance Logs Table
```
id: INTEGER PRIMARY KEY
username: TEXT
appliance: TEXT
energy_usage: REAL (kWh)
timestamp: TIMESTAMP
```

### User Settings Table
```
username: TEXT PRIMARY KEY
electricity_rate: REAL (₹/kWh)
monthly_budget: REAL (₹)
```

## 🎯 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Energy Data
- `POST /api/log-energy` - Log energy usage
- `GET /api/energy-logs/<username>` - Get all energy logs
- `GET /api/analysis/<username>` - Get energy analysis

### Appliances
- `POST /api/log-appliance` - Log appliance usage
- `GET /api/appliance-breakdown/<username>` - Get appliance breakdown

### Analytics
- `GET /api/weekly-summary/<username>` - Weekly data
- `GET /api/monthly-summary/<username>` - Monthly data

### Settings & Cost
- `GET /api/user-settings/<username>` - Get user settings
- `POST /api/user-settings/<username>` - Save user settings
- `GET /api/bill-calculation/<username>` - Get bill details
- `GET /api/recommendations/<username>` - Get energy recommendations

### Export
- `GET /api/download-csv/<username>` - Download energy logs as CSV

## 💻 Customization

### Change Electricity Rate
Edit in Frontend Settings or via API:
```bash
curl -X POST http://127.0.0.1:5000/api/user-settings/username \
  -H "Content-Type: application/json" \
  -d '{"electricity_rate": 7.0, "monthly_budget": 1500}'
```

### Modify Appliance List
Edit the appliance dropdown in `frontend/index.html`:
```html
<option value="Your Appliance">Your Appliance</option>
```

### Customize Recommendations
Edit the `recommendations()` function in `backend/app.py`

## 🐛 Troubleshooting

### Flask won't start
```bash
# Make sure port 5000 is not in use
# Try a different port:
python backend/app.py --port 5001
```

### Database errors
```bash
# Delete the database and restart
# It will be recreated automatically
rm backend/energy.db
python backend/app.py
```

### Login issues
- Clear browser cache (Ctrl+Shift+Delete)
- Make sure Flask server is running
- Check browser console (F12) for errors

### CORS errors
- Make sure Flask-CORS is installed
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
