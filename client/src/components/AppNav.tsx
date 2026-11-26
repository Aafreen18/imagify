import { Coins, House, ImagePlus, Moon, Sun, Tag, UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from './Brand'

export default function AppNav() {
  const { user, theme, toggleTheme } = useAuth()
  return <header className="app-nav">
    <div className="app-nav-left">
      <Brand />
      <NavLink to="/home" end className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}><House size={16} /> Home</NavLink>
      <NavLink to="/gallery" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}><ImagePlus size={16} /> My creations</NavLink>
      <NavLink to="/pricing" className={({ isActive }) => `nav-tab pricing-tab ${isActive ? 'active' : ''}`}><Tag size={16} /> Pricing</NavLink>
    </div>
    <div className="app-nav-right">
      <Link className="credit-badge" to="/pricing" aria-label={`${user?.creditBalance ?? 0} credits. Buy more`}><Coins size={15} /><span>{user?.creditBalance ?? 0} credits</span></Link>
      <button className="icon-button theme-button" title="Switch theme" onClick={toggleTheme}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
      <NavLink className="profile-trigger" aria-label="Open profile" to="/profile"><span className="avatar-small">{user?.name?.[0]?.toUpperCase()}</span><UserRound size={14} /></NavLink>
    </div>
  </header>
}
