import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand'

export default function PublicNav() {
  return <header className="public-nav">
    <Brand />
    <nav className="public-links"><a href="#how-it-works">How it works</a><a href="#stories">Stories</a></nav>
    <div className="nav-actions">
      <Link className="login-link" to="/login">Log in</Link>
      <Link className="button button-dark button-small" to="/register">Get started <ArrowRight size={15} /></Link>
    </div>
  </header>
}
