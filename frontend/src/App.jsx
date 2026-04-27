import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const { token } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App
