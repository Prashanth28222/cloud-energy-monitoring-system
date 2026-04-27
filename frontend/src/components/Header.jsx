import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header className={styles.header}>
      <div className={styles.logo}>⚡ Energy Monitoring System</div>
      <div className={styles.right}>
        {user && <span className={styles.badge}>Welcome, {user}</span>}
        <button className={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>
    </header>
  )
}
