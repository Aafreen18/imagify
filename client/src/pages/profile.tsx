import { ArrowLeft, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AppNav from '../components/AppNav'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return <div className="app-shell">
    <AppNav />
    <main className="profile-page">
      <Link to="/home" className="back-link"><ArrowLeft size={16} /> Back to your studio</Link>
      <div className="profile-card"><div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div><div className="section-kicker">YOUR LITTLE CORNER</div><h1>{user?.name}</h1><p className="profile-intro">A home for all the things you imagine.</p>
        <div className="profile-details"><div><span>NAME</span><b>{user?.name}</b></div><div><span>EMAIL ADDRESS</span><b>{user?.email}</b></div></div>
        <button className="button button-outline logout-button" onClick={() => { logout(); navigate('/') }}><LogOut size={16} /> Log out</button>
      </div>
    </main>
  </div>
}
