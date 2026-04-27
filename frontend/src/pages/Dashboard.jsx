import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import Header from '../components/Header'
import {
  getAppliances,
  getApplianceBreakdown,
  getBillingSummary,
  getCostByAppliance,
  getEnergyLogs,
  getMonthlySummary,
  getSettings,
  getWeeklySummary,
  logAppliance,
  logEnergy,
  saveBudget,
  saveRate,
} from '../api/client'
import styles from './Dashboard.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const CHART_COLORS = [
  '#7c3aed', '#a78bfa', '#5b21b6', '#ddd6fe', '#c4b5fd',
  '#8b5cf6', '#6d28d9', '#ede9fe', '#4c1d95', '#f5f3ff',
]

const chartOptions = (title) => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y ?? ctx.parsed} kWh` } },
  },
  scales: {
    y: { beginAtZero: true, ticks: { color: '#6b7280' }, grid: { color: '#e5e7eb' } },
    x: { ticks: { color: '#6b7280' }, grid: { display: false } },
  },
})

export default function Dashboard() {
  // ---- state ----
  const [energyKwh, setEnergyKwh] = useState('')
  const [energyMsg, setEnergyMsg] = useState(null)

  const [appliances, setAppliances] = useState([])
  const [selectedAppliance, setSelectedAppliance] = useState('')
  const [applianceKwh, setApplianceKwh] = useState('')
  const [applianceMsg, setApplianceMsg] = useState(null)

  const [energyLogs, setEnergyLogs] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [weekly, setWeekly] = useState({ labels: [], data: [] })
  const [monthly, setMonthly] = useState({ labels: [], data: [] })
  const [settings, setSettings] = useState({ electricity_rate: 6.5, monthly_budget: 1000 })
  const [rateInput, setRateInput] = useState('')
  const [budgetInput, setBudgetInput] = useState('')
  const [settingsMsg, setSettingsMsg] = useState(null)
  const [billing, setBilling] = useState(null)
  const [costByAppliance, setCostByAppliance] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [
        logsRes,
        appliancesRes,
        breakdownRes,
        weeklyRes,
        monthlyRes,
        settingsRes,
        billingRes,
        costRes,
      ] = await Promise.all([
        getEnergyLogs(),
        getAppliances(),
        getApplianceBreakdown(),
        getWeeklySummary(),
        getMonthlySummary(),
        getSettings(),
        getBillingSummary(),
        getCostByAppliance(),
      ])
      setEnergyLogs(logsRes.data.logs || [])
      setAppliances(appliancesRes.data || [])
      if (!selectedAppliance && appliancesRes.data?.length > 0) {
        setSelectedAppliance(appliancesRes.data[0])
      }
      setBreakdown(breakdownRes.data.breakdown || [])
      setWeekly(weeklyRes.data)
      setMonthly(monthlyRes.data)
      setSettings(settingsRes.data)
      setRateInput(settingsRes.data.electricity_rate)
      setBudgetInput(settingsRes.data.monthly_budget)
      setBilling(billingRes.data)
      setCostByAppliance(costRes.data.costs || [])
    } catch (err) {
      console.error('Error loading data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  // ---- Insights ----
  const totalKwh = energyLogs.reduce((s, l) => s + l.kwh, 0)
  const uniqueDays = energyLogs.length > 0
    ? new Set(energyLogs.map(l => new Date(l.timestamp).toDateString())).size
    : 1
  const avgDaily = energyLogs.length > 0 ? totalKwh / uniqueDays : 0
  const DAYS_IN_MONTH = 30
  const prediction = avgDaily * DAYS_IN_MONTH
  const status = totalKwh > settings.monthly_budget / settings.electricity_rate ? 'High' : 'Good'

  // ---- Handlers ----
  const handleLogEnergy = async (e) => {
    e.preventDefault()
    try {
      await logEnergy(parseFloat(energyKwh))
      setEnergyMsg({ type: 'success', text: `Logged ${energyKwh} kWh` })
      setEnergyKwh('')
      await Promise.all([getEnergyLogs(), getWeeklySummary(), getMonthlySummary(), getBillingSummary()].map(fn => fn()))
        .then(([logsRes, weeklyRes, monthlyRes, billingRes]) => {
          setEnergyLogs(logsRes.data.logs || [])
          setWeekly(weeklyRes.data)
          setMonthly(monthlyRes.data)
          setBilling(billingRes.data)
        })
    } catch (err) {
      setEnergyMsg({ type: 'error', text: err.response?.data?.error || 'Failed to log energy' })
    }
    setTimeout(() => setEnergyMsg(null), 3000)
  }

  const handleLogAppliance = async (e) => {
    e.preventDefault()
    try {
      await logAppliance(selectedAppliance, parseFloat(applianceKwh))
      setApplianceMsg({ type: 'success', text: `Logged ${applianceKwh} kWh for ${selectedAppliance}` })
      setApplianceKwh('')
      const [bdRes, costRes] = await Promise.all([getApplianceBreakdown(), getCostByAppliance()])
      setBreakdown(bdRes.data.breakdown || [])
      setCostByAppliance(costRes.data.costs || [])
    } catch (err) {
      setApplianceMsg({ type: 'error', text: err.response?.data?.error || 'Failed to log appliance' })
    }
    setTimeout(() => setApplianceMsg(null), 3000)
  }

  const handleSaveRate = async (e) => {
    e.preventDefault()
    try {
      await saveRate(parseFloat(rateInput))
      setSettingsMsg({ type: 'success', text: 'Rate saved' })
      const [sRes, bRes] = await Promise.all([getSettings(), getBillingSummary()])
      setSettings(sRes.data)
      setBilling(bRes.data)
    } catch {
      setSettingsMsg({ type: 'error', text: 'Failed to save rate' })
    }
    setTimeout(() => setSettingsMsg(null), 3000)
  }

  const handleSaveBudget = async (e) => {
    e.preventDefault()
    try {
      await saveBudget(parseFloat(budgetInput))
      setSettingsMsg({ type: 'success', text: 'Budget saved' })
      const [sRes, bRes] = await Promise.all([getSettings(), getBillingSummary()])
      setSettings(sRes.data)
      setBilling(bRes.data)
    } catch {
      setSettingsMsg({ type: 'error', text: 'Failed to save budget' })
    }
    setTimeout(() => setSettingsMsg(null), 3000)
  }

  const downloadCSV = () => {
    const header = 'Date,kWh'
    const rows = energyLogs
      .slice(0, 20)
      .map((l) => `${new Date(l.timestamp).toLocaleString()},${l.kwh}`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'energy-logs.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p>Loading dashboard…</p>
        </div>
      </>
    )
  }

  const doughnutData = {
    labels: breakdown.map((b) => b.appliance),
    datasets: [
      {
        data: breakdown.map((b) => b.total_kwh),
        backgroundColor: CHART_COLORS.slice(0, breakdown.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  const weeklyChartData = {
    labels: weekly.labels,
    datasets: [
      {
        label: 'kWh',
        data: weekly.data,
        backgroundColor: '#7c3aed',
        borderRadius: 6,
      },
    ],
  }

  const monthlyChartData = {
    labels: monthly.labels,
    datasets: [
      {
        label: 'kWh',
        data: monthly.data,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7c3aed',
        pointRadius: 3,
      },
    ],
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.grid}>
          {/* 1. Log Energy */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>⚡ Log Energy Usage</h2>
            <form onSubmit={handleLogEnergy} className={styles.form}>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                placeholder="Energy Used (kWh)"
                value={energyKwh}
                onChange={(e) => setEnergyKwh(e.target.value)}
                required
              />
              <button className={styles.btn} type="submit">Log Energy</button>
            </form>
            {energyMsg && (
              <div className={`${styles.msg} ${styles[energyMsg.type]}`}>{energyMsg.text}</div>
            )}
          </div>

          {/* 2. Track Appliances */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🔌 Track Appliances</h2>
            <form onSubmit={handleLogAppliance} className={styles.form}>
              <select
                className={styles.input}
                value={selectedAppliance}
                onChange={(e) => setSelectedAppliance(e.target.value)}
              >
                {appliances.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                placeholder="Energy Used (kWh)"
                value={applianceKwh}
                onChange={(e) => setApplianceKwh(e.target.value)}
                required
              />
              <button className={styles.btn} type="submit">Log Appliance</button>
            </form>
            {applianceMsg && (
              <div className={`${styles.msg} ${styles[applianceMsg.type]}`}>{applianceMsg.text}</div>
            )}
          </div>

          {/* 3. Insights */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📊 Your Insights</h2>
            <div className={styles.insightsGrid}>
              <div className={styles.insightItem}>
                <span className={styles.insightIcon}>⚡</span>
                <div className={styles.insightValue}>{totalKwh.toFixed(2)}</div>
                <div className={styles.insightLabel}>Total Usage (kWh)</div>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightIcon}>📅</span>
                <div className={styles.insightValue}>{avgDaily.toFixed(2)}</div>
                <div className={styles.insightLabel}>Avg Daily (kWh/day)</div>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightIcon}>🔮</span>
                <div className={styles.insightValue}>{prediction.toFixed(2)}</div>
                <div className={styles.insightLabel}>Prediction (kWh)</div>
              </div>
              <div className={styles.insightItem}>
                <span className={styles.insightIcon}>{status === 'Good' ? '✅' : '⚠️'}</span>
                <div
                  className={styles.insightValue}
                  style={{ color: status === 'Good' ? 'var(--success)' : 'var(--warning)' }}
                >
                  {status}
                </div>
                <div className={styles.insightLabel}>Status</div>
              </div>
            </div>
          </div>

          {/* 4. Appliance Breakdown */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🍩 Appliance Breakdown</h2>
            {breakdown.length === 0 ? (
              <p className={styles.empty}>No data yet</p>
            ) : (
              <>
                <div className={styles.chartWrapper}>
                  <Doughnut
                    data={doughnutData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} kWh`,
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className={styles.legend}>
                  {breakdown.map((b, i) => (
                    <div key={b.appliance} className={styles.legendItem}>
                      <span
                        className={styles.legendDot}
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span>{b.appliance}: {b.total_kwh.toFixed(2)} kWh</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 5. Weekly Summary */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📅 Weekly Summary</h2>
            <Bar data={weeklyChartData} options={chartOptions('Weekly')} />
          </div>

          {/* 6. Monthly Summary */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📆 Monthly Summary</h2>
            <Line data={monthlyChartData} options={chartOptions('Monthly')} />
          </div>

          {/* 7. Energy Logs */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>🗂️ Your Energy Logs</h2>
              <button className={styles.csvBtn} onClick={downloadCSV}>📥 Download CSV</button>
            </div>
            {energyLogs.length === 0 ? (
              <p className={styles.empty}>No logs yet</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>kWh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {energyLogs.slice(0, 20).map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>{log.kwh}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 8. Settings */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>⚙️ Settings & Preferences</h2>
            {settingsMsg && (
              <div className={`${styles.msg} ${styles[settingsMsg.type]}`}>{settingsMsg.text}</div>
            )}
            <div className={styles.settingsGrid}>
              <div className={styles.settingBox}>
                <h3 className={styles.settingLabel}>Electricity Rate (₹/kWh)</h3>
                <form onSubmit={handleSaveRate} className={styles.form}>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    required
                  />
                  <button className={styles.btn} type="submit">Save Rate</button>
                </form>
              </div>
              <div className={styles.settingBox}>
                <h3 className={styles.settingLabel}>Monthly Budget (₹)</h3>
                <form onSubmit={handleSaveBudget} className={styles.form}>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="1"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    required
                  />
                  <button className={styles.btn} type="submit">Save Budget</button>
                </form>
              </div>
            </div>
          </div>

          {/* 9. Billing */}
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <h2 className={styles.cardTitle}>💰 Monthly Bill & Cost Breakdown</h2>
            {billing && (
              <>
                <div className={styles.billingSummary}>
                  <div className={styles.billingItem}>
                    <div className={styles.billingValue}>{billing.total_kwh.toFixed(2)}</div>
                    <div className={styles.billingLabel}>Total kWh</div>
                  </div>
                  <div className={styles.billingItem}>
                    <div className={styles.billingValue}>₹{billing.bill.toFixed(2)}</div>
                    <div className={styles.billingLabel}>Bill Amount</div>
                  </div>
                  <div className={styles.billingItem}>
                    <div className={styles.billingValue}>₹{billing.budget.toFixed(2)}</div>
                    <div className={styles.billingLabel}>Budget</div>
                  </div>
                  <div className={styles.billingItem}>
                    <div
                      className={styles.billingValue}
                      style={{ color: billing.remaining >= 0 ? 'var(--success)' : 'var(--danger)' }}
                    >
                      ₹{billing.remaining.toFixed(2)}
                    </div>
                    <div className={styles.billingLabel}>Remaining</div>
                  </div>
                </div>

                {costByAppliance.length > 0 && (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Appliance</th>
                          <th>kWh</th>
                          <th>Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costByAppliance.map((c) => (
                          <tr key={c.appliance}>
                            <td>{c.appliance}</td>
                            <td>{c.kwh.toFixed(3)}</td>
                            <td>₹{c.cost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
